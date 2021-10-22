import { v4 as uuid } from "uuid";
import { getStatusObj, toValue } from ".";
import {
  COUNTER_TYPES,
  COUNTER_TYPES as TYPES,
  EVENTS,
  STATUSES,
} from "./constants";
import { getStageText } from "./texts";

export class Counter {
  constructor(options, players = 1) {
    this.active = options.active ?? options.values?.active ?? true;
    this.icons = options.icons ?? options.values?.icons ?? false;
    this.id = options.id ?? uuid();
    this.locked = options.locked ?? options.values?.locked ?? false;
    this.name = options.name ?? options.values?.name;
    this.next = options.next ?? options.values?.next ?? false;
    this.parent = options.parent ?? false;
    this.statuses = options.statuses ?? options.values?.statuses ?? false;
    this.statusesInitial = options.statusesInitial ?? this.statuses;
    this.modifiers = options.modifiers ?? options.values?.modifiers ?? false;
    this.triggers = options.triggers ?? options.values?.triggers ?? false;
    this.type = options.type ?? options.values?.type ?? false;
    this.valuesInitial = multiplyValues(
      options.values ?? options.values?.values ?? false,
      players
    );
    this.values = { ...this.valuesInitial };
  }

  reset() {
    this.values = this.valuesInitial;
    return this;
  }

  rename(name, replace) {
    this.name = replace ? this.name.replace(replace, name) : name;
    this.next = this.next ? this.next.replace(replace, name) : this.next;
    return this;
  }

  set(val) {
    this.values.value = val;
    return this;
  }

  setMax(val) {
    this.values.max = val;
    return this;
  }

  empty() {
    return this.set(0);
  }

  lock() {
    this.locked = true;
    return this;
  }

  unlock() {
    this.locked = false;
    return this;
  }

  resetStatuses() {
    this.statuses = this.statusesInitial;
    return this;
  }

  toggle(flag) {
    this.active = flag ?? !this.active;
    return this;
  }

  toggleStatus(key, flag) {
    this.statuses = { ...this.statuses, [key]: flag ?? !this.statuses[key] };
    return this;
  }

  add(value = 1, key = "value") {
    this.values = { ...this.values, [key]: this.values[key] + value };
    return this;
  }

  enable(val) {
    if (typeof val !== "undefined") this.set(val);
    return this.toggle(true);
  }

  disable() {
    return this.toggle(false);
  }

  enableStatus(key) {
    return this.toggleStatus(key, true);
  }

  disableStatus(key) {
    return this.toggleStatus(key, false);
  }

  addMax(value = 1) {
    return this.add(value, "max");
  }

  remove(value = 1) {
    return this.add(-value);
  }

  removeMax(value = 1) {
    return this.add(-value, "max");
  }
}

export class AllyCounter extends Counter {
  constructor(options, players) {
    super(
      {
        ...options,
        statuses: getStatusObj(STATUSES, options.status),
        type: COUNTER_TYPES.ALLY,
        values: options.hitPoints
          ? { max: options.hitPoints }
          : { complete: -2 },
      },
      players
    );
  }
}

export class MinionCounter extends Counter {
  constructor(options, players) {
    super(
      {
        ...options,
        statuses: getStatusObj(STATUSES, options.status),
        type: COUNTER_TYPES.MINION,
        values: options.hitPoints
          ? { max: options.hitPoints }
          : { complete: -2 },
      },
      players
    );
  }
}

export class SupportCounter extends Counter {
  constructor(options, players) {
    super(
      { ...options, type: COUNTER_TYPES.SUPPORT, values: { complete: -2 } },
      players
    );
  }
}

export class UpgradeCounter extends Counter {
  constructor(options, players) {
    super(
      { ...options, type: COUNTER_TYPES.UPGRADE, values: { complete: -2 } },
      players
    );
  }
}

export class CustomCounter extends Counter {
  constructor(options, players) {
    super(
      { ...options, type: COUNTER_TYPES.CUSTOM, values: { complete: -2 } },
      players
    );
  }
}

export function getCustomCounter(type, options, players) {
  const constructors = {
    [COUNTER_TYPES.ALLY]: AllyCounter,
    [COUNTER_TYPES.MINION]: MinionCounter,
    [COUNTER_TYPES.SUPPORT]: SupportCounter,
    [COUNTER_TYPES.UPGRADE]: UpgradeCounter,
  };

  return new (constructors[type] || CustomCounter)(options, players);
}

const getExtraCounters = (counters, options, players) => {
  return (counters || []).map(
    (c) => new Counter({ name: c.name, values: c, ...options }, players)
  );
};

const getFullCounter = (options, children, players) => {
  const parentCounter = new Counter(options, players);
  return [
    parentCounter,
    ...getExtraCounters(children, { parent: parentCounter.id }, players),
  ];
};

const getHeroCounter = (setup) => (hero) => {
  return getFullCounter(
    {
      name: hero.name,
      statuses: getStatusObj(STATUSES),
      type: TYPES.HERO,
      values: { max: hero.hitPoints },
    },
    (hero.counters || []).map((c) => ({ ...c, type: TYPES.HERO_TOKEN })),
    setup.settings.players
  );
};

const getSideCounter = (setup) => (scheme) =>
  new Counter(
    { active: false, type: TYPES.SIDE_SCHEME, values: scheme },
    setup.settings.players
  );

const getVillainName = (villain, stage) =>
  villain.levels[stage].name || `${villain.name} ${getStageText(stage)}`;

const getVillainCounter = (setup) => (villain) => {
  const getSkirmish = (level, stages) => {
    return stages[level]
      ? [level]
      : Object.keys(villain.levels)[level - 1]
      ? [Object.keys(villain.levels)[level - 1]]
      : level <= 0
      ? Object.keys(villain.levels)
      : getSkirmish(`${level - 1}`, stages);
  };
  const stages = (
    isNaN(setup.skirmish)
      ? villain.stages[setup.mode.toLowerCase()]
      : getSkirmish(+setup.skirmish, villain.levels)
  ).map(
    (s, i, list) =>
      new Counter(
        {
          active: i === 0,
          name: getVillainName(villain, s),
          next:
            s.next ?? (!!list[i + 1] && getVillainName(villain, list[i + 1])),
          statuses: getStatusObj(STATUSES, villain.levels[s].status),
          triggers: villain.levels[s].triggers,
          type: TYPES.VILLAIN,
          values: { max: villain.levels[s].complete || villain.levels[s] },
        },
        setup.settings.players
      )
  );

  return [
    ...stages,
    ...getExtraCounters(
      villain.counters,
      { parent: stages[0].id },
      setup.settings.players
    ),
  ].flat();
};

const getMainSchemeCounter = (setup) => (scheme, i, list) => {
  return getFullCounter(
    {
      active: scheme.active ?? i === 0,
      next: scheme.next ?? list[i + 1]?.name ?? false,
      type: TYPES.SCENARIO,
      values: scheme,
    },
    [
      ...(scheme.counters || []),
      ...(i === 0
        ? [
            {
              name: "Acceleration",
              type: TYPES.ACCELERATION,
              complete: -1,
            },
          ]
        : []),
    ],
    setup.settings.players
  );
};

const getSideSchemes = (setup) => [
  ...setup.heroes.map((h) => h.sideSchemes).flat(),
  ...setup.scenario.sideSchemes,
  ...setup.scenario.modular.map((mod) => mod.sideSchemes).flat(),
];

const multiplyValues = (values, players) => {
  const { advance, complete, max, min, start, step, value } = values;
  return {
    advance: advance ?? "max",
    complete: toValue(complete ?? max, players),
    max: toValue(max ?? complete ?? 0, players),
    min: toValue(min ?? 0, players),
    step: toValue(step ?? 1, players),
    value: toValue(value ?? start ?? min ?? 0, players),
  };
};

const runEnterTriggers = (counters, setup, data) => {
  counters
    .filter((counter) => counter.active)
    .map((counter) => counter.triggers?.[EVENTS.ENTER] || [])
    .flat()
    .forEach((trigger) => {
      switch (trigger.event) {
        case EVENTS.ENTER_SCHEME:
          return counters.find((c) => trigger.targets === c.name)?.enable();
        case EVENTS.ENTER_MINION:
          return counters.push(
            ...new Array(trigger.perPlayer ? +setup.settings.players : 1)
              .fill(null)
              .map(
                () =>
                  new MinionCounter(
                    data.minions.find((m) => trigger.targets === m.name)
                  )
              )
          );
        default:
          break;
      }
    });
  return counters;
};

export const getCounters = (setup, data) => {
  return runEnterTriggers(
    [
      new Counter({
        name: "Rounds",
        type: TYPES.ROUNDS,
        values: { min: 1 },
      }),
      new Counter({
        name: "Phases",
        type: TYPES.PHASES,
        values: { min: 1 },
      }),
      ...setup.heroes.map(getHeroCounter(setup)).flat(),
      ...setup.scenario.villains.map(getVillainCounter(setup)).flat(),
      ...setup.scenario.mainScheme.map(getMainSchemeCounter(setup)).flat(),
      ...getSideSchemes(setup).map(getSideCounter(setup)),
    ],
    setup,
    data
  );
};
