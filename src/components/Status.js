import { useEffect, useState } from "react";
import { getStatusObj, load, persist } from "../utils";
import {
  COUNTERS_SCHEME,
  COUNTER_TYPES,
  EVENTS,
  RESULT_TYPES,
  STATUSES,
  STORAGE_KEYS,
  TRIGGERS,
  TRIGGERS_ACTIONS,
} from "../utils/constants";
import { getCounter, getCounters } from "../utils/counters";
import { getResText } from "../utils/texts";
import Counter from "./Counter";
import { CounterBox } from "./CounterBox";
import Log from "./Log";
import Timer from "./Timer";
import Actions, { Action } from "./ui/Actions";
import Box from "./ui/Box";
import Modal from "./ui/Modal";
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

const byName = (a, b) => a.name.localeCompare(b.name);

export default function Status({ matchId, onReplay, onQuit, options, setup }) {
  const [counters, setCounters] = useState(false);
  const [log, setLog] = useState([]);
  const [interacted, setInteracted] = useState(false);
  const [quit, setQuit] = useState(false);
  const [custom, setCustom] = useState("");
  const [time, setTime] = useState(0);
  const [firstPlayer, setFirstPlayer] = useState(0);
  const [result, setResult] = useState(null);

  const accelerationCounters = (counters || []).filter(isAcceleration);
  const customCounters = (counters || []).filter(isCustomCounter);
  const heroesCounters = (counters || []).filter(isHeroCounter);
  const mainScheme = (counters || []).find(isMainCounter);
  const roundsCounter = (counters || []).find(isRoundCounter);
  const sideSchemes = (counters || []).filter(isSideCounter);
  const villainCounters = (counters || []).filter(isVillainCounter);

  const logEvent = (event, entity, data) => {
    setLog((l) => [{ date: new Date(), time, event, entity, data }, ...l]);
  };

  const updateCounter = (id, values, force = false) => {
    setInteracted(true);
    if ((force || !result) && id)
      setCounters((cs) =>
        cs.map((c) => (c.id === id ? { ...c, ...values } : c))
      );
  };

  const changePlayer = (direction) => {
    setFirstPlayer((fp) => {
      for (let offset = 1; offset <= heroesCounters.length; ++offset) {
        const next =
          (offset * direction + fp + heroesCounters.length) %
          heroesCounters.length;
        if (heroesCounters[next].active) return next;
      }
      return fp;
    });
  };

  const nextPlayer = () => changePlayer(1);

  const revertNextRound = (counter, value) => {
    changePlayer(-1);
    return revertValue(counter, value);
  };

  const revertEnd = () => {
    setResult(false);
    removeLastLog();
    handleUndo(log[1]);
  };

  const revertStatus = (counter, status, value) => {
    return revert(counter, {
      status: { ...counter.status, [status]: value },
    });
  };

  const revertLevel = (counter, key, val) => {
    return revert(counter, {
      levels: counter.levels.map((level, i) =>
        i === counter.stage ? { ...level, [key]: level[key] + val } : level
      ),
    });
  };
  const revertValue = (counter, val) => revertLevel(counter, "value", val);
  const revertLimit = (counter, val) => revertLevel(counter, "limit", val);

  const nextRound = (counter) => {
    logEvent(EVENTS.NEW_ROUND, counter.id, 1);
    nextPlayer();
    updateCounter(counter.id, {
      levels: [{ ...counter.levels[0], value: counter.levels[0].value + 1 }],
    });
  };

  const doUpdate = (event, entity, values, data) => {
    logEvent(event, entity, data || values);
    updateCounter(entity, values);
  };

  const removeLastLog = (count = 1) => {
    setLog((l) => [...l].slice(count));
  };

  const revert = (counter, values) => {
    removeLastLog();
    updateCounter(counter.id, values, true);
  };

  const endGame = (counter, result) => {
    logEvent(EVENTS.COMPLETE, counter.id);
    logEvent(EVENTS.END, false, result);
    setResult(result);
  };

  const handleQuit = (reason) => {
    onQuit({ reason, counters, time, log });
  };

  const handleMenu = () => (result ? handleQuit(result) : setQuit(true));
  const handleDiscard = () => onQuit(false);
  const handleGiveUp = () => handleQuit(RESULT_TYPES.GIVE_UP);
  const handleLostByScheme = () => handleQuit(RESULT_TYPES.SCHEME);
  const handleHeroesDead = () => handleQuit(RESULT_TYPES.DEFEATED);
  const handleVillainsDead = () => handleQuit(RESULT_TYPES.WINNER);
  const handleWonByScheme = () => handleQuit(RESULT_TYPES.SCHEME_WIN);

  const disableCounter = (counter) => {
    updateCounter(counter.id, { active: false });
  };

  const handleDefeat = (counter) => {
    (counter.levels[counter.stage].triggers?.[TRIGGERS.DEFEAT] || []).forEach(
      (trigger) => {
        switch (trigger.action) {
          case TRIGGERS_ACTIONS.NEXT_SCENARIO:
            return doUpdate(EVENTS.NEXT, mainScheme.id, {
              stage: mainScheme.stage + 1,
            });
          case TRIGGERS_ACTIONS.ENTER_SCHEME:
            return handleEnable(
              counters.find((c) => c.name === trigger.entity)
            );

          default:
            break;
        }
      }
    );
    if (counter.stage + 1 < counter.levels.length) {
      doUpdate(EVENTS.NEXT, counter.id, { stage: counter.stage + 1 });
      (counter.levels[counter.stage + 1].status || []).forEach((st) => {
        if (!counter.status[st]) handleStatusToggle(counter)("Tough", true);
      });
    } else {
      logEvent(EVENTS.COMPLETE, counter.id);
      [counter, ...counters.filter(childOf(counter))].map(disableCounter);
    }
  };

  const handlePrevious = (counter) => {
    if (counter.stage > 0) {
      doUpdate(EVENTS.PREVIOUS, counter.id, { stage: counter.stage - 1 });
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
      doUpdate(EVENTS.NEXT, counter.id, { stage: counter.stage + 1 });
    }
  };

  const handleDisable = (counter) => {
    doUpdate(EVENTS.DISABLE, counter.id, { active: false });
  };

  const handleCompleteSide = (counter) => {
    doUpdate(EVENTS.COMPLETE, counter.id, { active: false });
  };

  const handleEnable = (counter) => {
    if (!counter.active && !result) {
      doUpdate(EVENTS.ENTER, counter.id, {
        active: true,
        levels: counter.initialLevels || counter.levels,
      });
    }
  };

  const handleRestart = () => {
    if (result) {
      onReplay({ reason: result, counters, time, log });
    } else {
      setLog([]);
      setCounters(getCounters(setup));
      logEvent(EVENTS.RESTART);
    }
  };

  const handleStatusToggle = (counter) => (status, flag) => {
    doUpdate(
      flag ? EVENTS.STATUS_ENABLE : EVENTS.STATUS_DISABLE,
      counter.id,
      { status: { ...counter.status, [status]: flag } },
      status
    );
  };

  const handleAddCustomCounter = (name, type) => () => {
    if (name) {
      const count = counters.filter((c) => c.name.startsWith(name));
      const counter = getCounter({
        active: false,
        name: `${name} ${count.length + 1}`,
        type: type || COUNTER_TYPES.CUSTOM,
        status: ["Ally", "Minion"].includes(name) && getStatusObj(STATUSES),
      });
      setCounters((cs) => [...cs, counter]);
      handleEnable(counter);
    }
  };

  const handleAddSide = (counter) => () => {
    if (!counter.active && !result) {
      handleEnable(counter);
    }
  };

  const handleAddCounter = () => {
    if (custom) {
      handleAddCustomCounter(custom)();
      setCustom("");
    }
  };

  const handleAddCounterSubmit = (e) => {
    e.preventDefault();
    handleAddCounter(e);
  };

  const handleUndo = (entry) => {
    const lastLog = entry || log[0];
    const counter = counters.find((c) => c.id === lastLog.entity);

    switch (lastLog.event) {
      case EVENTS.COMPLETE:
      case EVENTS.DISABLE:
        return revert(counter, { active: true });
      case EVENTS.DECREASE:
        return revertValue(counter, lastLog.data);
      case EVENTS.DEC_LIMIT:
        return revertLimit(counter, lastLog.data);
      case EVENTS.END:
        return revertEnd();
      case EVENTS.ENTER:
        return revert(counter, { active: false });
      case EVENTS.INCREASE:
      case EVENTS.VILLAIN_PHASE:
        return revertValue(counter, -lastLog.data);
      case EVENTS.INC_LIMIT:
        return revertLimit(counter, -lastLog.data);
      case EVENTS.NEW_ROUND:
        return revertNextRound(counter, -lastLog.data);
      case EVENTS.NEXT:
        return revert(counter, { stage: counter.stage - 1 });
      case EVENTS.PREVIOUS:
        return revert(counter, { stage: counter.stage + 1 });
      case EVENTS.STATUS_DISABLE:
        return revertStatus(counter, lastLog.data, true);
      case EVENTS.STATUS_ENABLE:
        return revertStatus(counter, lastLog.data, false);

      case EVENTS.RESTART:
      case EVENTS.START:
      default:
        return false;
    }
  };

  useEffect(() => {
    const saved = load(STORAGE_KEYS.CURRENT);
    if (saved) {
      setResult(saved.result || false);
      setCounters(saved.counters);
      setFirstPlayer(saved.firstPlayer);
      setTime(saved.time);
      setLog(saved.log.map((l) => ({ ...l, date: new Date(l.date) })));
    } else {
      setCounters(getCounters(setup));
      logEvent(EVENTS.START);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setup]);

  useEffect(() => {
    if (counters && !result) {
      if (counters.filter(isHeroCounter).every(isNotActive)) {
        setResult(RESULT_TYPES.DEFEATED);
        logEvent(EVENTS.END, false, RESULT_TYPES.DEFEATED);
      }
      if (counters.filter(isVillainCounter).every(isNotActive)) {
        setResult(RESULT_TYPES.WINNER);
        logEvent(EVENTS.END, false, RESULT_TYPES.WINNER);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counters]);

  useEffect(() => {
    if (interacted && window.navigator.vibrate) window.navigator.vibrate(50);
  }, [counters, interacted, result]);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", quit);
  }, [quit]);

  useEffect(() => {
    persist(STORAGE_KEYS.CURRENT, {
      counters,
      firstPlayer,
      log,
      matchId,
      result,
      setup,
      time,
    });
  }, [counters, firstPlayer, log, matchId, result, setup, time]);

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

  const activeIcons = (counters || [])
    .filter(isActive)
    .map((c) => c.icons || [])
    .flat()
    .sort((a, b) => a.localeCompare(b));

  const defaultCounterProps = { logEvent, onUpdate: updateCounter, result };

  return (
    counters && (
      <div>
        {quit && (
          <Modal onClick={() => setQuit(false)}>
            <button onClick={handleGiveUp}>Give up</button>
            <button onClick={handleLostByScheme}>Lost by scheme</button>
            <button onClick={handleHeroesDead}>All heroes dead</button>
            <button onClick={handleVillainsDead}>Villain defeated</button>
            <button onClick={handleWonByScheme}>Won by scheme</button>
            <button onClick={handleDiscard}>Discard match</button>
            <button onClick={() => setQuit(false)}>Close menu</button>
          </Modal>
        )}
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
            siblings={counters.filter(isActive).filter(childOf(mainScheme))}
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
              {customCounters
                .filter(isActive)
                .sort(byName)
                .map((counter) => (
                  <Counter
                    counter={counter}
                    key={counter.id}
                    onComplete={() => handleDisable(counter)}
                    onStatusToggle={handleStatusToggle(counter)}
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
                  onChange={handleAddSide(counter)}
                  value={counter.name}
                />
              ))}
            </fieldset>
            <fieldset>
              <legend>- Extra counters</legend>
              <Option
                checked={false}
                label="Add ally counter"
                onChange={handleAddCustomCounter("Ally")}
                type={false}
              />
              <Option
                checked={false}
                label="Add minion counter"
                onChange={handleAddCustomCounter("Minion")}
                type={false}
              />
              <Option
                checked={false}
                label="Add support counter"
                onChange={handleAddCustomCounter("Support")}
                type={false}
              />
              <Option
                checked={false}
                label="Add upgrade counter"
                onChange={handleAddCustomCounter("Upgrade")}
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
          <Log counters={counters} log={log} />
        </div>
        <Timer
          disabled={result || quit}
          interacted={interacted}
          onChange={setTime}
          time={time}
          visible={options.timer}
        />
        <Actions
          title={
            <Report
              heroes={heroesCounters}
              icons={activeIcons}
              mainScheme={mainScheme}
              nextRound={() => nextRound(roundsCounter)}
              result={result && getResText(result)}
              round={roundsCounter?.levels[roundsCounter.stage].value}
              villains={villainCounters}
            />
          }
          types={result && ["result", result]}
        >
          <Action label="Undo" onClick={() => handleUndo()} />
          <Action
            label={result ? "Replay" : "Restart"}
            onClick={handleRestart}
          />
          <Action label={result ? "Exit" : "Menu"} onClick={handleMenu} />
        </Actions>
      </div>
    )
  );
}
