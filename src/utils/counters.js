import { v4 as uuid } from "uuid";
import { getStatusObj, toValue } from ".";
import {
  COUNTER_TYPES,
  STATUSES,
  TRIGGERS,
  TRIGGERS_ACTIONS,
} from "./constants";
import { getStageText } from "./texts";

export const getCounter = ({
  active = true,
  levels,
  name,
  parent = false,
  stage = 0,
  ...rest
}) => {
  return {
    active,
    id: uuid(),
    levels: levels || [{ name, start: 0, value: 0, limit: -1 }],
    name,
    parent,
    stage,
    ...rest,
  };
};

const getFullCounter = (name, type, levels, children, options) => {
  const parentCounter = getCounter({
    name,
    type,
    levels,
    ...options,
  });
  const extra = (children || []).map((c) =>
    getCounter({
      name: `${name} | ${c.name}`,
      type: c.type || `${type}-child`,
      levels: [c],
      parent: parentCounter.id,
      ...c,
    })
  );

  return [parentCounter, ...extra];
};

const getHeroCounter = (hero) =>
  getFullCounter(
    hero.name,
    COUNTER_TYPES.HERO,
    [{ name: hero.name, limit: hero.hitPoints }],
    hero.counters,
    { status: getStatusObj(STATUSES) }
  );

const getSideCounter = (scheme) =>
  getFullCounter(scheme.name, COUNTER_TYPES.SIDE_SCHEME, [scheme], [], {
    active: typeof scheme.active === "boolean" ? scheme.active : false,
    icons: scheme.icons || [],
  });

const getVillainCounter = (setup) => (villain) => {
  const stages = isNaN(setup.skirmish)
    ? villain.stages[setup.mode.toLowerCase()]
    : [setup.skirmish];
  return [
    ...getFullCounter(
      villain.name,
      COUNTER_TYPES.VILLAIN,
      stages.map((stage) => ({
        name:
          villain.levels[stage].name ||
          `${villain.name} ${getStageText(stage)}`,
        limit: villain.levels[stage].complete || villain.levels[stage],
        triggers: villain.levels[stage].triggers,
        status: villain.levels[stage].status,
      })),
      villain.counters,
      { status: getStatusObj(STATUSES, villain.levels[stages[0]].status) }
    ),
  ];
};

const getMainSchemeCounter = (scenario) =>
  getFullCounter(scenario.name, COUNTER_TYPES.SCENARIO, scenario.mainScheme, [
    ...scenario.mainScheme
      .filter((s) => s.counters)
      .map((s) => s.counters)
      .flat(),
    ...scenario.mainScheme
      .filter((s) => s.children)
      .map((s) => s.children)
      .flat(),
    { name: "Acceleration", type: COUNTER_TYPES.ACCELERATION, limit: -1 },
  ]);

const multiply = (players) => (counter) => {
  const multiplied = (counter.levels || []).map((level) => ({
    ...level,
    advance: ["string", "number"].includes(typeof level.advance)
      ? toValue(level.advance, players)
      : level.advance,
    complete: toValue(level.complete || 0, players),
    limit: toValue(level.limit || level.complete || 0, players),
    start: toValue(level.start || 0, players),
    step: toValue(level.step || 0, players),
    value: toValue(level.start || 0, players),
  }));
  return {
    ...counter,
    levels: multiplied,
    initialLevels: multiplied,
  };
};

const getSideSchemes = (setup) => [
  ...setup.heroes.map((h) => h.sideSchemes).flat(),
  ...setup.scenario.sideSchemes,
  ...setup.scenario.modular.map((mod) => mod.sideSchemes).flat(),
];

const runTrigger = (triggers) => (counter) => {
  triggers
    .filter((t) => t.entity === counter.name)
    .forEach((t) => {
      switch (t.action) {
        case TRIGGERS_ACTIONS.ENTER_SCHEME:
          return (counter.active = true);
        default:
          break;
      }
    });
  return counter;
};

export const getCounters = (setup) => {
  const counters = [
    getCounter({
      name: "Rounds",
      levels: [{ name: "Rounds", min: 1, start: 1, limit: -1 }],
      type: COUNTER_TYPES.ROUNDS,
    }),
    ...setup.heroes.map(getHeroCounter).flat(),
    ...setup.scenario.villains.map(getVillainCounter(setup)).flat(),
    ...getMainSchemeCounter(setup.scenario),
    ...getSideSchemes(setup).map(getSideCounter).flat(),
  ].map(multiply(setup.settings.players));

  const triggers = counters
    .filter((counter) => counter.active)
    .map((c) => c.levels[c.stage].triggers?.[TRIGGERS.ENTER] || [])
    .flat();

  return counters.map(runTrigger(triggers));
};
