import {
  COUNTER_TYPES as CTYPES,
  EVENTS,
  FILTERS,
  MODIFIERS,
  RESULT_TYPES,
} from "./constants";
import { getModifiers, isTarget } from "./status";

const is = (entry, event, type, counters, events) => {
  return (
    entry.event === event ||
    (events.includes(entry.event) &&
      counters.find((c) => c.id === entry.entity).type === type)
  );
};

const isEntered = (...args) => {
  return is(...args, [EVENTS.ENTER, EVENTS.CREATE, EVENTS.ENA]);
};

const isCompleted = (...args) => {
  return is(...args, [EVENTS.DISABLE, EVENTS.COMPLETE]);
};

export function getMatchStats(match) {
  const mods = getModifiers(match.counters);

  const getMax = (counter) =>
    mods
      .filter((m) => isTarget(counter, m.targets))
      .filter((m) => m.action === MODIFIERS.HIT_POINTS)
      .reduce((a, b) => a + b.data.value, counter.values?.max);

  const isAlly = (entry) =>
    isEntered(entry, EVENTS.ENTER_ALLY, CTYPES.ALLY, match.counters);
  const isAllyDefeated = (entry) =>
    isCompleted(entry, EVENTS.ALLY_DEFEATED, CTYPES.ALLY, match.counters);
  const isMinion = (entry) =>
    isEntered(entry, EVENTS.ENTER_MINION, CTYPES.MINION, match.counters);
  const isMinionDefeated = (entry) =>
    isCompleted(entry, EVENTS.MINION_DEFEATED, CTYPES.MINION, match.counters);
  const isSide = (entry) =>
    isEntered(entry, EVENTS.ENTER_SCHEME, CTYPES.SIDE_SCHEME, match.counters);
  const isSideDefeated = (entry) =>
    isCompleted(entry, EVENTS.SIDE_CLEARED, CTYPES.SIDE_SCHEME, match.counters);

  return {
    log: match.log.reduce(
      (acc, entry) => ({
        rounds: (acc.rounds || 1) + (entry.event === EVENTS.NEW_ROUND),
        allies: (acc.allies || 0) + isAlly(entry),
        allDef: (acc.allDef || 0) + isAllyDefeated(entry),
        minions: (acc.minions || 0) + isMinion(entry),
        minDef: (acc.minDef || 0) + isMinionDefeated(entry),
        schemes: (acc.schemes || 0) + isSide(entry),
        sideCl: (acc.sideCl || 0) + isSideDefeated(entry),
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
      id: c.id,
      type: c.type,
      next: c.next,
      start: c.valuesInitial?.value,
      value: c.values?.value,
      max: getMax(c),
    })),
    heroes: match.setup.heroesAndAspects?.map((h) => ({
      name: h.name,
      counter: match.counters.find((c) => c.bSide === h.name),
    })),
    complete: match.complete,
    date: new Date(match.date),
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

export function getScenarioName(setup) {
  return setup.scenarioName || setup.scenario.name;
}

export function getHeroesAndAspects(setup) {
  return setup.heroesAndAspects || setup.heroes;
}

export function getModularSets(setup) {
  return setup.modularSets || (setup.scenario.modular || []).map((m) => m.name);
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
  return getHeroesAndAspects(match.setup)
    .map((h) => h.aspects.map((a) => [a, match.reason]))
    .flat()
    .reduce(addToObj, aspects);
}

function getHeroes(heroes, match) {
  return getHeroesAndAspects(match.setup)
    .map((h) => [h.name, match.reason])
    .reduce(addToObj, heroes);
}

function getModular(modularSets, match) {
  return (getModularSets(match.setup) || [])
    .map((mod) => [mod, match.reason])
    .reduce(addToObj, modularSets);
}

function getScenario(scenario, match) {
  return addToObj(scenario, [getScenarioName(match.setup), match.reason]);
}

function getModes(modes, match) {
  return addToObj(modes, [match.setup.mode, match.reason]);
}

function getPlayersStats(players, match) {
  return addToObj(players, [
    getHeroesAndAspects(match.setup).length,
    match.reason,
  ]);
}

function getFastest(fastest, match) {
  return match.complete && (!fastest || match.time < fastest.time)
    ? match
    : fastest;
}

function getLongest(longest, match) {
  return match.complete && (!longest || match.time > longest.time)
    ? match
    : longest;
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

const getValues = (match, filter) => {
  switch (filter) {
    case FILTERS.RESULT:
      return [match.reason];
    case FILTERS.PLAYERS:
      return [`${getHeroesAndAspects(match.setup).length}`];
    case FILTERS.HERO:
      return getHeroesAndAspects(match.setup).map((h) => h.name);
    case FILTERS.ASPECT:
      return getHeroesAndAspects(match.setup)
        .map((h) => h.aspects)
        .flat();
    case FILTERS.SCENARIO:
      return getScenarioName(match.setup);
    case FILTERS.MODES:
      return [match.setup.mode];
    case FILTERS.MODULAR:
      return getModularSets(match.setup) || [];
    default:
      return true;
  }
};

export const isVisible = (match) => (filter) =>
  getValues(match, filter[0]).includes(filter[1]);
