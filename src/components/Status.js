import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { load, persist, toValue } from "../utils";
import {
  COUNTERS_SCHEME,
  COUNTER_TYPES,
  EVENTS,
  RESULT_TYPES,
  STORAGE_KEYS,
} from "../utils/constants";
import { getResText, getStageName, getStageText } from "../utils/texts";
import Counter from "./Counter";
import { CounterBox } from "./CounterBox";
import Log from "./Log";
import Box from "./ui/Box";
import Option from "./ui/Option";

const isActive = (counter) => counter.active;
const isNotActive = (counter) => !counter.active;
const childOf = (parent) => (counter) => counter.parent === parent.id;
const isSideCounter = (counter) => COUNTERS_SCHEME.includes(counter.type);
const isAcceleration = (counter) => counter.type === COUNTER_TYPES.ACCELERATION;
const isVillainCounter = (counter) => counter.type === COUNTER_TYPES.VILLAIN;
const isMainCounter = (counter) => counter.type === COUNTER_TYPES.SCENARIO;
const isHeroCounter = (counter) => counter.type === COUNTER_TYPES.HERO;
const isCustomCounter = (counter) => counter.type === COUNTER_TYPES.CUSTOM;

const statuses = {
  Confused: false,
  Stunned: false,
  Tough: false,
};

const getCounter = ({
  active = true,
  levels,
  name,
  parent = false,
  stage = 0,
  status,
  type,
}) => {
  return {
    active,
    id: uuid(),
    levels: levels || [{ name, start: 0, value: 0, limit: -1 }],
    name,
    parent,
    stage,
    status,
    type,
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
    { status: statuses }
  );

const getSideCounter = (scheme) =>
  getFullCounter(scheme.name, COUNTER_TYPES.SIDE_SCHEME, [scheme], [], {
    active: typeof scheme.active === "boolean" ? scheme.active : false,
  });

const getVillainCounter = (mode) => (villain) =>
  [
    ...getFullCounter(
      villain.name,
      COUNTER_TYPES.VILLAIN,
      villain.stages[mode.toLowerCase()].map((stage) => ({
        name: `${villain.name} ${getStageText(stage)}`,
        limit: villain.levels[stage],
      })),
      villain.counters,
      { status: statuses }
    ),
  ];

const getMainSchemeCounter = (scenario) =>
  getFullCounter(scenario.name, COUNTER_TYPES.SCENARIO, scenario.mainScheme, [
    { name: "Acceleration", type: COUNTER_TYPES.ACCELERATION, limit: -1 },
    ...scenario.mainScheme
      .filter((s) => s.counters)
      .map((s) => s.counters)
      .flat(),
  ]);

const multiply = (players) => (counter) => {
  const multiplied = (counter.levels || []).map((level) => ({
    ...level,
    advance: toValue(level.advance, players),
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

const getCounters = (setup) =>
  [
    ...setup.heroes.map(getHeroCounter).flat(),
    ...setup.scenario.villains.map(getVillainCounter(setup.mode)).flat(),
    ...getMainSchemeCounter(setup.scenario),
    ...getSideSchemes(setup).map(getSideCounter).flat(),
  ].map(multiply(setup.settings.players));

export default function Status({ matchId, onResult, onQuit, result, setup }) {
  const [counters, setCounters] = useState(false);
  const [log, setLog] = useState([]);
  const [interacted, setInteracted] = useState(false);
  const [custom, setCustom] = useState("");

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

  const doUpdate = (event, counter, values, entity, logData) => {
    logEvent(event, entity || counter.id, logData || { counter });
    updateCounter(counter.id, values);
  };

  const endGame = (event, counter, result) => {
    logEvent(event, counter.id, { counter });
    onResult(result, counters, log);
  };

  const handleGiveUp = () => {
    onResult(RESULT_TYPES.GIVE_UP, counters, log);
    onQuit();
  };

  const disableCounter = (counter) => {
    updateCounter(counter.id, { active: false });
  };

  const handleDefeat = (counter) => {
    if (counter.stage + 1 < counter.levels.length) {
      doUpdate(EVENTS.NEXT, counter, { stage: counter.stage + 1 });
    } else {
      logEvent(EVENTS.COMPLETE, counter.id, { counter });
      [counter, ...counters.filter(childOf(counter))].map(disableCounter);
    }
  };

  const handlePrevious = (counter) => {
    if (counter.stage > 0) {
      doUpdate(EVENTS.PREVIOUS, counter, { stage: counter.stage - 1 });
    }
  };

  const handleComplete = (counter) => {
    const stage = counter.levels[counter.stage];
    const hasAdvance = Number.isInteger(stage.advance);
    const advance =
      stage.advance < stage.limit
        ? stage.value <= stage.advance
        : stage.value >= stage.advance;
    const complete =
      stage.advance > stage.limit
        ? stage.value <= stage.limit
        : stage.value >= stage.limit;
    const last = counter.stage + 1 >= counter.levels.length;

    if (hasAdvance && advance && last) {
      endGame(EVENTS.COMPLETE, counter, RESULT_TYPES.SCHEME_WIN);
    } else if ((hasAdvance && complete) || (complete && last)) {
      endGame(EVENTS.COMPLETE, counter, RESULT_TYPES.SCHEME);
    } else {
      doUpdate(EVENTS.NEXT, counter, { stage: counter.stage + 1 });
    }
  };

  const handleDisable = (counter) => {
    doUpdate(EVENTS.DISABLE, counter, { active: false });
  };

  const handleCompleteSide = (counter) => {
    doUpdate(EVENTS.COMPLETE, counter, {
      active: false,
      levels: counter.initialLevels,
    });
  };

  const handleEnable = (counter) => {
    if (!counter.active) {
      doUpdate(EVENTS.ENTER, counter, { active: true });
    }
  };

  const handleRestart = () => {
    onResult(false);
    setLog([]);
    setCounters(getCounters(setup));
    logEvent(EVENTS.RESTART);
  };

  const handleStatusToggle = (counter) => (status, flag) => {
    doUpdate(
      flag ? EVENTS.STATUS_ENABLE : EVENTS.STATUS_DISABLE,
      counter,
      { status: { ...counter.status, [status]: flag } },
      `${counter.id}|${status}`,
      { name: getStageName(counter), status }
    );
  };

  const handleAddCounter = () => {
    if (custom) {
      const counter = getCounter({
        active: false,
        name: custom,
        type: COUNTER_TYPES.CUSTOM,
      });
      setCounters((cs) => [...cs, counter]);
      setCustom("");
      handleEnable(counter);
    }
  };

  useEffect(() => {
    const saved = load(STORAGE_KEYS.CURRENT);
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
      onResult(RESULT_TYPES.DEFEATED, counters, log);
    }
    if (counters && counters.filter(isVillainCounter).every(isNotActive)) {
      onResult(RESULT_TYPES.WINNER, counters, log);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counters]);

  useEffect(() => {
    interacted && window.navigator.vibrate(50);
    persist(STORAGE_KEYS.CURRENT, { counters, log, matchId, result, setup });
  }, [counters, interacted, log, matchId, result, setup]);

  useEffect(() => {
    if (interacted && result) {
      logEvent(EVENTS.END, false, { result, resultText: getResText(result) });
    }
  }, [interacted, result]);

  const defaultCounterProps = { logEvent, onUpdate: updateCounter, result };

  const heroesCounters = (counters || []).filter(isHeroCounter);
  const villainCounters = (counters || []).filter(isVillainCounter);
  const mainScheme = (counters || []).find(isMainCounter);
  const sideSchemes = (counters || []).filter(isSideCounter);
  const customCounters = (counters || []).filter(isCustomCounter);

  return (
    counters && (
      <div>
        <div className="box__wrapper">
          {heroesCounters.map((counter) => (
            <CounterBox
              commonProps={defaultCounterProps}
              counter={counter}
              key={counter.id}
              lastLabel="💀"
              onComplete={handleDefeat}
              onStatusToggle={handleStatusToggle(counter)}
              siblings={counters.filter(childOf(counter))}
              title="Hits"
              type={counter.type}
            />
          ))}
        </div>
        <div className="box__wrapper">
          {villainCounters.map((counter) => (
            <CounterBox
              commonProps={defaultCounterProps}
              counter={counter}
              key={counter.id}
              lastLabel="💀"
              onComplete={handleDefeat}
              onStatusToggle={handleStatusToggle(counter)}
              siblings={counters.filter(childOf(counter))}
              title="Hits"
              type={counter.type}
            />
          ))}
        </div>
        <div className="box__wrapper">
          <CounterBox
            acceleration={counters
              .filter(childOf(mainScheme))
              .find(isAcceleration)}
            commonProps={defaultCounterProps}
            counter={mainScheme}
            onComplete={handleComplete}
            onPrevious={handlePrevious}
            siblings={counters.filter(childOf(mainScheme))}
            title="Threats"
            type="scheme"
          />
          {!!sideSchemes.filter(isActive).length && (
            <Box title="Side schemes" flat type="scheme">
              {sideSchemes.filter(isActive).map((counter) => (
                <Counter
                  counter={counter}
                  key={counter.id}
                  over={true}
                  onComplete={handleCompleteSide}
                  onEnable={handleEnable}
                  title={counter.levels[counter.stage].name}
                  {...defaultCounterProps}
                />
              ))}
            </Box>
          )}
        </div>
        {!!customCounters.filter(isActive).length && (
          <div className="box__wrapper">
            <Box title="Custom" flat>
              {customCounters.filter(isActive).map((counter) => (
                <Counter
                  counter={counter}
                  key={counter.id}
                  onComplete={() => handleDisable(counter)}
                  over={true}
                  title={counter.levels[counter.stage].name}
                  {...defaultCounterProps}
                />
              ))}
            </Box>
          </div>
        )}
        <div className="box__wrapper">
          <Box title="Other counters" flat flag type="scheme">
            {sideSchemes.map((counter) => (
              <Option
                key={counter.id}
                checked={counter.active}
                label={counter.name}
                onChange={() => handleEnable(counter)}
                value={counter.name}
              />
            ))}
            <fieldset>
              <legend>Add custom counter</legend>
              <input
                placeholder="Name"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
              />{" "}
              <span onClick={handleAddCounter}>Add</span>
            </fieldset>
          </Box>
        </div>
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
        <div className="box__wrapper">
          <Log log={log} />
        </div>
      </div>
    )
  );
}
