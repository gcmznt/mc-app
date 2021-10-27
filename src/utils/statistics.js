import { EVENTS, FILTERS, MODIFIERS, RESULT_TYPES } from "./constants";
import { getModifiers, isTarget } from "./status";

export function getMatchStats(match) {
  const mods = getModifiers(match.counters);

  const getMax = (counter, max) =>
    mods
      .filter((m) => isTarget(counter, m.targets))
      .filter((m) => m.action === MODIFIERS.HIT_POINTS)
      .reduce((a, b) => a + b.data.value, max);

  return {
    log: match.log.reduce(
      (acc, entry) => ({
        rounds: (acc.rounds || 1) + (entry.event === EVENTS.NEW_ROUND),
        allies: (acc.allies || 0) + (entry.event === EVENTS.ENTER_ALLY),
        allDef: (acc.allDef || 0) + (entry.event === EVENTS.ALLY_DEFEATED),
        minions: (acc.minions || 0) + (entry.event === EVENTS.ENTER_MINION),
        minDef: (acc.minDef || 0) + (entry.event === EVENTS.MINION_DEFEATED),
        schemes: (acc.schemes || 0) + (entry.event === EVENTS.ENTER_SCHEME),
        sideCl: (acc.sideCl || 0) + (entry.event === EVENTS.SIDE_CLEARED),
        flips:
          entry.entity && entry.event === EVENTS.FLIP_HERO
            ? {
                ...acc.flips,
                [entry.entity]: (acc.flips?.[entry.entity] || 0) + 1,
              }
            : acc.flips,
      }),
      {}
    ),
    finalStatus: match.counters.map((c) => ({
      name: c.aSide || c.name,
      active: c.active,
      type: c.type,
      next: c.next,
      value: c.values?.value,
      max: getMax(c, c.values?.max),
    })),
    heroes: match.setup.heroesAndAspects?.map((h) => ({
      name: h.name,
      counter: match.counters.find((c) => c.bSide === h.name),
    })),
    complete: match.complete,
    date: match.date,
    device: match.device,
    matchId: match.matchId,
    reason: match.reason,
    trash: match.trash,
    setup: match.setup,
    time: match.time,
  };
}

const EMPTY_RESULTS = Object.fromEntries(
  Object.values(RESULT_TYPES).map((v) => [v, 0])
);

export const byDate = (a, b) => new Date(b.date) - new Date(a.date);

export function getWins(values) {
  return values[RESULT_TYPES.SCHEME_WIN] + values[RESULT_TYPES.WINNER];
}

export function getLost(values) {
  return (
    values[RESULT_TYPES.DEFEATED] +
    values[RESULT_TYPES.SCHEME] +
    values[RESULT_TYPES.GIVE_UP]
  );
}

export function getPerc(values) {
  const w = getWins(values);
  const l = getLost(values);

  return w + l ? ((w / (w + l)) * 100).toFixed(1) : "-";
}

export function getScenarioName(match) {
  return match.setup.scenarioName || match.setup.scenario.name;
}

export function getHeroesAndAspects(match) {
  return match.setup.heroesAndAspects || match.setup.heroes;
}

function getModularSets(match) {
  return (
    match.setup.modularSets ||
    (match.setup.scenario.modular || []).map((m) => m.name)
  );
}

function getMatchesStats(res, match) {
  return {
    ...res,
    [match.reason]: (res[match.reason] || 0) + 1,
  };
}

const addToObj = (obj, [k, v]) => ({
  ...obj,
  [k]: { ...(obj[k] || EMPTY_RESULTS), [v]: (obj[k]?.[v] || 0) + 1 },
});

function getAspects(aspects, match) {
  return getHeroesAndAspects(match)
    .map((h) => h.aspects.map((a) => [a, match.reason]))
    .flat()
    .reduce(addToObj, aspects);
}

function getHeroes(heroes, match) {
  return getHeroesAndAspects(match)
    .map((h) => [h.name, match.reason])
    .reduce(addToObj, heroes);
}

function getModular(modularSets, match) {
  return (getModularSets(match) || [])
    .map((mod) => [mod, match.reason])
    .reduce(addToObj, modularSets);
}

function getScenario(scenario, match) {
  return addToObj(scenario, [getScenarioName(match), match.reason]);
}

function getModes(modes, match) {
  return addToObj(modes, [match.setup.mode, match.reason]);
}

function getPlayersStats(players, match) {
  return addToObj(players, [getHeroesAndAspects(match).length, match.reason]);
}

function getFastest(fastest, match) {
  return match.complete && (!fastest || match.time < fastest.time)
    ? match
    : fastest;
}

function getLongest(longest, match) {
  return match.complete && match.time > longest.time ? match : longest;
}

export function getStats(matches = []) {
  return matches.reduce(
    (stats, match) => ({
      ...stats,
      aspects: getAspects(stats.aspects, match),
      fastest: getFastest(stats.fastest, match),
      heroes: getHeroes(stats.heroes, match),
      longest: getLongest(stats.longest, match),
      modes: getModes(stats.modes, match),
      modular: getModular(stats.modular, match),
      players: getPlayersStats(stats.players, match),
      results: getMatchesStats(stats.results, match),
      scenario: getScenario(stats.scenario, match),
    }),
    {
      aspects: {},
      fastest: false,
      heroes: {},
      longest: false,
      modes: {},
      modular: {},
      played: matches.length,
      players: {},
      results: EMPTY_RESULTS,
      scenario: {},
    }
  );
}

export const isVisible = (match) => (filter) => {
  switch (filter[0]) {
    case FILTERS.RESULT:
      return match.reason === filter[1];
    case FILTERS.PLAYERS:
      return getHeroesAndAspects(match).length === +filter[1];
    case FILTERS.HERO:
      return getHeroesAndAspects(match)
        .map((h) => h.name)
        .includes(filter[1]);
    case FILTERS.ASPECT:
      return getHeroesAndAspects(match)
        .map((h) => h.aspects)
        .flat()
        .includes(filter[1]);
    case FILTERS.SCENARIO:
      return getScenarioName(match).includes(filter[1]);
    case FILTERS.MODES:
      return match.setup.mode === filter[1];
    case FILTERS.MODULAR:
      return (getModularSets(match) || []).includes(filter[1]);
    default:
      return true;
  }
};
