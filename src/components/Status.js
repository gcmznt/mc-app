import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { load, persist, toValue } from "../utils";
import {
  COUNTERS_SCHEME,
  COUNTER_TYPES,
  EVENTS,
  RESULT_TYPES,
  STORAGE_KEYS,
  TRIGGERS,
} from "../utils/constants";
import { getResText, getStageName, getStageText } from "../utils/texts";
import Counter from "./Counter";
import { CounterBox } from "./CounterBox";
import Log from "./Log";
import Timer from "./Timer";
import Actions, { Action } from "./ui/Actions";
import Box from "./ui/Box";
import Option from "./ui/Option";
import Report from "./ui/Report";

const childOf = (parent) => (counter) => counter.parent === parent.id;
const isActive = (counter) => counter.active;
const isNotActive = (counter) => !counter.active;
const isAcceleration = (counter) => counter.type === COUNTER_TYPES.ACCELERATION;
const isCustomCounter = (counter) => counter.type === COUNTER_TYPES.CUSTOM;
const isHeroCounter = (counter) => counter.type === COUNTER_TYPES.HERO;
const isMainCounter = (counter) => counter.type === COUNTER_TYPES.SCENARIO;
const isRoundCounter = (counter) => counter.type === COUNTER_TYPES.ROUNDS;
const isSideCounter = (counter) => COUNTERS_SCHEME.includes(counter.type);
const isVillainCounter = (counter) => counter.type === COUNTER_TYPES.VILLAIN;

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
    icons: scheme.icons || [],
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

const runTrigger = (triggers) => (counter) => {
  triggers
    .filter((t) => t.entity === counter.name)
    .forEach((t) => {
      switch (t.action) {
        case TRIGGERS.ENTER_SCHEME:
          return (counter.active = true);
        default:
          break;
      }
    });
  return counter;
};

const getCounters = (setup) => {
  const counters = [
    getCounter({
      name: "Rounds",
      levels: [{ name: "Rounds", min: 1, start: 1, limit: -1 }],
      type: COUNTER_TYPES.ROUNDS,
    }),
    ...setup.heroes.map(getHeroCounter).flat(),
    ...setup.scenario.villains.map(getVillainCounter(setup.mode)).flat(),
    ...getMainSchemeCounter(setup.scenario),
    ...getSideSchemes(setup).map(getSideCounter).flat(),
  ].map(multiply(setup.settings.players));

  const triggers = counters
    .filter((c) => c.active && c.levels[c.stage].triggers)
    .map((c) => c.levels[c.stage].triggers)
    .flat();

  return counters.map(runTrigger(triggers));
};

export default function Status({
  matchId,
  onResult,
  onQuit,
  options,
  result,
  setup,
}) {
  const [counters, setCounters] = useState(false);
  const [log, setLog] = useState([]);
  const [interacted, setInteracted] = useState(false);
  const [custom, setCustom] = useState("");
  const [time, setTime] = useState(0);

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

  const nextRound = (counter) => {
    logEvent(EVENTS.INCREASE, counter.id, { counter, val: 1 });
    updateCounter(counter.id, {
      levels: [{ ...counter.levels[0], value: counter.levels[0].value + 1 }],
    });
  };

  const doUpdate = (event, counter, values, entity, logData) => {
    logEvent(event, entity || counter.id, logData || { counter });
    updateCounter(counter.id, values);
  };

  const removeLastLog = () => {
    setLog((l) => [...l].slice(1));
  };

  const revert = (counter, values) => {
    removeLastLog();
    updateCounter(counter.id, values);
  };

  const endGame = (counter, result) => {
    logEvent(EVENTS.COMPLETE, counter.id, { counter });
    onResult(result, counters, log);
  };

  const handleGiveUp = () => {
    onResult(RESULT_TYPES.GIVE_UP, counters, log, true);
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
      endGame(counter, RESULT_TYPES.SCHEME_WIN);
    } else if ((hasAdvance && complete) || (complete && last)) {
      endGame(counter, RESULT_TYPES.SCHEME);
    } else {
      doUpdate(EVENTS.NEXT, counter, { stage: counter.stage + 1 });
    }
  };

  const handleDisable = (counter) => {
    doUpdate(EVENTS.DISABLE, counter, { active: false });
  };

  const handleCompleteSide = (counter) => {
    doUpdate(EVENTS.COMPLETE, counter, { active: false });
  };

  const handleEnable = (counter) => {
    if (!counter.active) {
      doUpdate(EVENTS.ENTER, counter, {
        active: true,
        levels: counter.initialLevels || counter.levels,
      });
    }
  };

  const handleRestart = () => {
    onResult(false);
    setLog([]);
    setCounters(getCounters(setup));
    logEvent(EVENTS.RESTART);
  };

  const handleQuit = () => {
    onQuit();
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

  const handleAddCustomCounter = (name, type) => {
    if (name) {
      const counter = getCounter({
        active: false,
        name: name,
        type: type || COUNTER_TYPES.CUSTOM,
      });
      setCounters((cs) => [...cs, counter]);
      handleEnable(counter);
    }
  };

  const handleAddCounter = () => {
    if (custom) {
      handleAddCustomCounter(custom);
      setCustom("");
    }
  };

  const handleAddCounterSubmit = (e) => {
    e.preventDefault();
    handleAddCounter();
  };

  const handleUndo = () => {
    const counter = log[0].entity
      ? counters.find((c) => c.id === log[0].entity?.split("|")[0])
      : false;

    switch (log[0].event) {
      case EVENTS.COMPLETE:
        return revert(counter, { active: true });
      case EVENTS.DECREASE:
        return revert(counter, {
          levels: counter.levels.map((level, i) =>
            i === counter.stage
              ? { ...level, value: level.value + log[0].data.val }
              : level
          ),
        });
      case EVENTS.DEC_LIMIT:
        return revert(counter, {
          levels: counter.levels.map((level, i) =>
            i === counter.stage
              ? { ...level, limit: level.limit + log[0].data.val }
              : level
          ),
        });
      case EVENTS.DISABLE:
        return revert(counter, { active: true });
      case EVENTS.END:
        removeLastLog();
        return onResult(false);
      case EVENTS.ENTER:
        return revert(counter, { active: false });
      case EVENTS.INCREASE:
        return revert(counter, {
          levels: counter.levels.map((level, i) =>
            i === counter.stage
              ? { ...level, value: level.value - log[0].data.val }
              : level
          ),
        });
      case EVENTS.INC_LIMIT:
        return revert(counter, {
          levels: counter.levels.map((level, i) =>
            i === counter.stage
              ? { ...level, limit: level.limit - log[0].data.val }
              : level
          ),
        });
      case EVENTS.NEXT:
        return revert(counter, { stage: counter.stage - 1 });
      case EVENTS.PREVIOUS:
        return revert(counter, { stage: counter.stage + 1 });
      case EVENTS.RESTART:
        return false;
      case EVENTS.START:
        return false;
      case EVENTS.STATUS_DISABLE:
        return revert(counter, {
          status: { ...counter.status, [log[0].entity.split("|")[1]]: true },
        });
      case EVENTS.STATUS_ENABLE:
        return revert(counter, {
          status: { ...counter.status, [log[0].entity.split("|")[1]]: false },
        });
      case EVENTS.VILLAIN_PHASE:
        return revert(counter, {
          levels: counter.levels.map((level, i) =>
            i === counter.stage
              ? { ...level, value: level.value - log[0].data.val }
              : level
          ),
        });

      default:
        return false;
    }
  };

  useEffect(() => {
    const saved = load(STORAGE_KEYS.CURRENT);
    if (saved) {
      setCounters(saved.counters);
      setTime(saved.time);
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
  }, [counters, interacted, result]);

  useEffect(() => {
    persist(STORAGE_KEYS.CURRENT, {
      counters,
      log,
      matchId,
      result,
      setup,
      time,
    });
  }, [counters, log, matchId, result, setup, time]);

  useEffect(() => {
    if (interacted && result) {
      logEvent(EVENTS.END, false, { result, resultText: getResText(result) });
    }
  }, [interacted, result]);

  const defaultCounterProps = { logEvent, onUpdate: updateCounter, result };

  const accelerationCounters = (counters || []).filter(isAcceleration);
  const customCounters = (counters || []).filter(isCustomCounter);
  const heroesCounters = (counters || []).filter(isHeroCounter);
  const mainScheme = (counters || []).find(isMainCounter);
  const roundsCounter = (counters || []).find(isRoundCounter);
  const sideSchemes = (counters || []).filter(isSideCounter);
  const villainCounters = (counters || []).filter(isVillainCounter);

  const acceleration =
    accelerationCounters.reduce(
      (a, cur) => a + cur?.levels[cur?.stage].value || 0,
      0
    ) +
    (counters || [])
      .filter(isActive)
      .filter((c) => c.icons?.length)
      .map((c) => c.icons)
      .flat()
      .reduce((a, b) => a + +(b === "Acceleration"), 0);

  const firstPlayer =
    (roundsCounter?.levels[roundsCounter.stage].value - 1) %
    heroesCounters.length;

  const activeIcons = (counters || [])
    .filter(isActive)
    .map((c) => c.icons || [])
    .flat()
    .sort((a, b) => a.localeCompare(b));

  return (
    counters && (
      <div>
        <div className="box__wrapper">
          <Box key="Rounds" title="Rounds" type="rounds">
            <Counter
              counter={roundsCounter}
              type={roundsCounter.type}
              {...defaultCounterProps}
            />
          </Box>
        </div>
        <div className="box__wrapper">
          {heroesCounters.map((counter, i) => (
            <CounterBox
              commonProps={defaultCounterProps}
              counter={counter}
              highlight={firstPlayer === i}
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
              onPrevious={handlePrevious}
              onStatusToggle={handleStatusToggle(counter)}
              siblings={counters.filter(childOf(counter))}
              title="Hits"
              type={counter.type}
            />
          ))}
        </div>
        <div className="box__wrapper">
          <CounterBox
            acceleration={acceleration}
            commonProps={defaultCounterProps}
            counter={mainScheme}
            onComplete={handleComplete}
            onPrevious={handlePrevious}
            siblings={counters.filter(childOf(mainScheme))}
            title="Threats"
            type="scheme"
          />
          {!!sideSchemes.filter(isActive).length && (
            <Box key="Side schemes" title="Side schemes" flat type="scheme">
              {sideSchemes.filter(isActive).map((counter) => (
                <Counter
                  counter={counter}
                  key={counter.id}
                  onComplete={handleCompleteSide}
                  title={counter.levels[counter.stage].name}
                  {...defaultCounterProps}
                />
              ))}
            </Box>
          )}
          {!!customCounters.filter(isActive).length && (
            <Box key="Extra" title="Extra" flat>
              {customCounters.filter(isActive).map((counter) => (
                <Counter
                  counter={counter}
                  key={counter.id}
                  onComplete={() => handleDisable(counter)}
                  title={counter.levels[counter.stage].name}
                  {...defaultCounterProps}
                />
              ))}
            </Box>
          )}
          <Box key="Add counters" title="Add counters" flat flag type="scheme">
            <fieldset>
              <legend>- Side schemes</legend>
              {sideSchemes.map((counter) => (
                <Option
                  key={counter.id}
                  checked={counter.active}
                  label={counter.name}
                  onChange={() => handleEnable(counter)}
                  value={counter.name}
                />
              ))}
            </fieldset>
            <fieldset>
              <legend>- Extra counters</legend>
              <Option
                checked={false}
                label="Add ally counter"
                onChange={() => handleAddCustomCounter("Ally")}
                type={false}
              />
              <Option
                checked={false}
                label="Add minion counter"
                onChange={() => handleAddCustomCounter("Minion")}
                type={false}
              />
              <Option
                checked={false}
                label="Add support counter"
                onChange={() => handleAddCustomCounter("Support")}
                type={false}
              />
              <Option
                checked={false}
                label="Add upgrade counter"
                onChange={() => handleAddCustomCounter("Upgrade")}
                type={false}
              />
              <form onSubmit={handleAddCounterSubmit}>
                <input
                  placeholder="Custom name"
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                />{" "}
                <span onClick={handleAddCounter}>Add</span>
              </form>
            </fieldset>
          </Box>
        </div>
        <div className="box__wrapper">
          <Log log={log} />
        </div>
        {options.timer && (
          <Timer time={time} onChange={setTime} disabled={result} />
        )}
        <Actions
          title={
            <Report
              result={result && getResText(result)}
              round={roundsCounter?.levels[roundsCounter.stage].value}
              icons={activeIcons}
            />
          }
          types={result && ["result", result]}
        >
          <Action
            label="Round"
            onClick={() => nextRound(roundsCounter)}
            disabled={!!result}
          />
          <Action label="Undo" onClick={handleUndo} />
          <Action label="Restart" onClick={handleRestart} />
          <Action
            label={result ? "Exit" : "Give up"}
            onClick={result ? handleQuit : handleGiveUp}
          />
        </Actions>
      </div>
    )
  );
}
