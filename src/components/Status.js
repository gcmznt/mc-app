import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { toValue } from "../utils";
import {
  COUNTERS_SCHEME,
  COUNTER_TYPES,
  EVENTS,
  RESULT_TYPES,
  STORAGE_KEYS,
} from "../utils/constants";
import { getResText } from "../utils/texts";
import Counter from "./Counter";
import { CounterBox } from "./CounterBox";
import Log from "./Log";
import Box from "./ui/Box";
import Option from "./ui/Option";

const isActive = (counter) => counter.active;
const isNotActive = (counter) => !counter.active;
const childOf = (parent) => (counter) => counter.parent === parent.id;
const isSideCounter = (counter) => COUNTERS_SCHEME.includes(counter.type);
const isVillainCounter = (counter) => counter.type === COUNTER_TYPES.VILLAIN;
const isMainCounter = (counter) => counter.type === COUNTER_TYPES.SCENARIO;
const isHeroCounter = (counter) => counter.type === COUNTER_TYPES.HERO;

const getCounter = (options) => {
  return {
    active: typeof options.active !== "undefined" ? options.active : true,
    id: uuid(),
    levels: options.levels,
    initialLevels: options.levels,
    name: options.name,
    parent: options.parent,
    stage: options.stage || 0,
    type: options.type,
  };
};

const getStageText = (level) => new Array(level).fill("I").join("");

const getFullCounter = (name, type, levels, children) => {
  const parentCounter = getCounter({
    name,
    type,
    levels,
  });
  const extra = (children || []).map((c) =>
    getCounter({
      name: `${name} | ${c[0]}`,
      type: `${type}-extra`,
      levels: [c],
      parent: parentCounter.id,
    })
  );

  return [parentCounter, ...extra];
};

const getHeroCounter = (players) => (hero) =>
  [
    ...getFullCounter(
      hero.name,
      "hero",
      [[hero.name, 0, hero.hitPoints]],
      hero.counters
    ),
    ...hero.sideSchemes.map((s) =>
      getCounter({
        active: false,
        name: `${hero.name} | ${s.name}`,
        type: "nemesis-scheme",
        levels: [
          [
            s.name,
            toValue(s.start || 0, players),
            toValue(s.complete || 0, players),
          ],
        ],
      })
    ),
  ];

const getVillainCounter = (scenario, mode, players) => [
  ...getFullCounter(
    scenario.villain,
    "villain",
    scenario.stages[mode.toLowerCase()].map((s) => [
      `${scenario.villain} ${getStageText(s)}`,
      0,
      toValue(scenario.levels[s] || 0, players),
    ]),
    (scenario.counters || []).map((c) => [
      c[0],
      toValue(c[1] || 0, players),
      toValue(c[2] || 0, players),
      toValue(c[3], players),
    ])
  ),
  ...(scenario.sideSchemes || []).map((s) =>
    getCounter({
      active: false,
      name: `${scenario.villain} | ${s.name}`,
      type: "side-scheme",
      levels: [
        [
          s.name,
          toValue(s.start || 0, players),
          toValue(s.complete || 0, players),
        ],
      ],
    })
  ),
  ...scenario.modular
    .map((mod) =>
      mod.sideSchemes.map((s) =>
        getCounter({
          active: false,
          name: `${mod.name} | ${s.name}`,
          type: "modular-scheme",
          levels: [
            [
              s.name,
              toValue(s.start || 0, players),
              toValue(s.complete || 0, players),
            ],
          ],
        })
      )
    )
    .flat(),
];

const getMainSchemeCounter = (scenario, players) =>
  getFullCounter(
    scenario.name,
    "scenario",
    scenario.mainScheme.map((s) => [
      s.name,
      toValue(s.start || 0, players),
      toValue(s.complete || 0, players),
      toValue(s.advance, players),
    ]),
    ...scenario.mainScheme
      .filter((s) => s.counters)
      .map((s) =>
        s.counters.map((c) => [
          c[0],
          toValue(c[1] || 0, players),
          toValue(c[2] || 0, players),
          toValue(c[3], players),
        ])
      )
  );

const getCounters = (setup) => [
  ...setup.heroes.map(getHeroCounter(setup.settings.players)).flat(),
  ...getVillainCounter(setup.scenario, setup.mode, setup.settings.players),
  ...getMainSchemeCounter(setup.scenario, setup.settings.players),
];

export default function Status({ onResult, onQuit, result, setup }) {
  const [counters, setCounters] = useState(false);
  const [log, setLog] = useState([]);
  const [interacted, setInteracted] = useState(false);

  const logEvent = (event, entity, data) => {
    setLog((l) => [
      { id: uuid(), date: new Date(), event, entity, data },
      ...l,
    ]);
  };

  const updateCounter = (id, values) => {
    setInteracted(true);
    if (!result && id)
      setCounters((cs) =>
        cs.map((c) => (c.id === id ? { ...c, ...values } : c))
      );
  };

  const doUpdate = (event, counter, values) => {
    logEvent(event, counter.id, counter);
    updateCounter(counter.id, values);
  };

  const endGame = (event, counter, result) => {
    logEvent(event, counter.id, counter);
    onResult(result, counters);
  };

  const handleDefeat = (counter) => {
    if (counter.stage + 1 < counter.levels.length) {
      doUpdate(EVENTS.NEXT, counter, { stage: counter.stage + 1 });
    } else {
      endGame(EVENTS.COMPLETE, counter, RESULT_TYPES.WINNER);
    }
  };

  const handleGiveUp = () => {
    onResult(RESULT_TYPES.GIVE_UP, counters);
    onQuit();
  };

  const disableCounter = (counter) => {
    updateCounter(counter.id, { active: false });
  };

  const handleHeroDefeat = (counter) => () => {
    [counter, ...counters.filter(childOf(counter))].map(disableCounter);
  };

  const handlePrevious = (counter) => {
    if (counter.stage > 0) {
      doUpdate(EVENTS.PREVIOUS, counter, { stage: counter.stage - 1 });
    }
  };

  const handleComplete = (counter) => {
    const stage = counter.levels[counter.stage];
    const hasAdvance = Number.isInteger(stage[3]);
    const advance = stage[3] === stage[1];
    const complete = stage[2] === stage[1];
    const last = counter.stage + 1 >= counter.levels.length;

    if (hasAdvance && advance && last) {
      endGame(EVENTS.COMPLETE, counter, RESULT_TYPES.SCHEME_WIN);
    } else if ((hasAdvance && complete) || (complete && last)) {
      endGame(EVENTS.COMPLETE, counter, RESULT_TYPES.SCHEME);
    } else {
      doUpdate(EVENTS.NEXT, counter, { stage: counter.stage + 1 });
    }
  };

  const handleCompleteSide = (counter) => {
    doUpdate(EVENTS.COMPLETE, counter, {
      active: false,
      levels: counter.initialLevels,
    });
  };

  const handleEnableSide = (counter) => {
    doUpdate(EVENTS.ENTER, counter, { active: true });
  };

  const handleRestart = () => {
    onResult(false);
    setLog([]);
    setCounters(getCounters(setup));
    logEvent(EVENTS.RESTART);
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT));
    if (saved) {
      setCounters(saved.counters);
      setLog(saved.log.map((l) => ({ ...l, date: new Date(l.date) })));
    } else {
      setCounters(getCounters(setup));
      logEvent(EVENTS.START);
    }
  }, [setup]);

  useEffect(() => {
    if (counters && counters.filter(isHeroCounter).every(isNotActive)) {
      onResult(RESULT_TYPES.DEFEATED, counters);
    }
  }, [counters, onResult]);

  useEffect(() => {
    interacted && window.navigator.vibrate(50);
    localStorage.setItem(
      STORAGE_KEYS.CURRENT,
      JSON.stringify({ counters, log, result, setup })
    );
  }, [counters, interacted, log, result, setup]);

  useEffect(() => {
    if (interacted && result) {
      logEvent(EVENTS.END, false, { result, resultText: getResText(result) });
    }
  }, [interacted, result]);

  const defaultCounterProps = { logEvent, onUpdate: updateCounter, result };

  const heroesCounters = (counters || []).filter(isHeroCounter);
  const villainCounter = (counters || []).find(isVillainCounter);
  const mainScheme = (counters || []).find(isMainCounter);
  const sideSchemes = (counters || []).filter(isSideCounter);

  return (
    counters && (
      <div>
        {heroesCounters.map((counter) => (
          <CounterBox
            commonProps={defaultCounterProps}
            counter={counter}
            key={counter.id}
            lastLabel="💀"
            onComplete={handleHeroDefeat(counter)}
            siblings={counters.filter(childOf(counter))}
            title="Hits"
            type={counter.type}
          />
        ))}
        <CounterBox
          commonProps={defaultCounterProps}
          counter={villainCounter}
          lastLabel="💀"
          onComplete={handleDefeat}
          siblings={counters.filter(childOf(villainCounter))}
          title="Hits"
        />
        <CounterBox
          commonProps={defaultCounterProps}
          counter={mainScheme}
          onComplete={handleComplete}
          onPrevious={handlePrevious}
          siblings={counters.filter(childOf(mainScheme))}
          title="Threats"
          type="scheme"
        />

        <Box title="Side schemes" flat type="scheme">
          {sideSchemes.filter(isActive).map((c) => (
            <Counter
              counter={c}
              key={c.id}
              over={true}
              onComplete={handleCompleteSide}
              onEnable={handleEnableSide}
              {...defaultCounterProps}
            />
          ))}
        </Box>
        <Box title="Other side schemes" flat flag type="scheme">
          {sideSchemes.map((counter) => (
            <Option
              key={counter.id}
              checked={counter.active}
              label={counter.name}
              onChange={() => handleEnableSide(counter)}
              value={counter.name}
            />
          ))}
        </Box>
        {result ? (
          <div className={`result is-${result}`}>
            <div>{getResText(result)}</div>
            <button onClick={onQuit}>Exit</button>
            <button onClick={handleRestart}>Restart</button>
          </div>
        ) : (
          <div>
            <button onClick={handleGiveUp}>Give up</button>
            <button onClick={handleRestart}>Restart</button>
          </div>
        )}
        <Log log={log} />
      </div>
    )
  );
}
