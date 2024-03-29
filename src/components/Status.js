/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useData } from "../context/data";
import { useNotifications } from "../context/notifications";

import { getRandomList, load, persist, scrollToId, toValue } from "../utils";
import {
  COUNTER_TYPES as CTYPES,
  EVENTS,
  RESULT_TYPES,
  STORAGE_KEYS,
  TRIGGER_MAP,
} from "../utils/constants";
import { Counter as CounterObj, getCounters } from "../utils/counters";
import { dispatch } from "../utils/events";
import { getEntryTime, useLogger } from "../utils/log";
import { getAcceleration, useCountersUtils } from "../utils/status";
import { getResText } from "../utils/texts";

import Counter from "./Counter";
import CounterBox from "./CounterBox";
import AddCounter from "./AddCounter";
import LogString from "./LogString";
import MatchMenu from "./MatchMenu";
import Timer from "./Timer";

import Actions, { Action } from "./ui/Actions";
import Box from "./ui/Box";
import LogItem from "./ui/LogItem";
import Navbar from "./ui/NavBar";
import Report from "./ui/Report";

const childOf = (parent) => (counter) => counter.parent === parent.id;
const isActive = (counter) => counter.active;
const isLast = (counter) => !counter.next;
const isNotActive = (counter) => !counter.active;

const byName = (a, b) => a.name.localeCompare(b.name);

const byNameAndParent = (list, parent = false) => {
  return list
    .filter((el) => el.parent === parent)
    .sort(byName)
    .map((el) => [el, ...byNameAndParent(list, el.id)])
    .flat();
};

const getNextPlayer = (counters, active, dir = 1, offset = 1) => {
  const next = (active + counters.length + offset * dir) % counters.length;

  if (offset > counters.length) return -1;
  if (active === -1) return counters.findIndex((c) => c.active);

  return counters[next].active
    ? next
    : getNextPlayer(counters, active, dir, offset + 1);
};

export default function Status({ matchId, onQuit, setup }) {
  const { t } = useTranslation();
  const { addNotification } = useNotifications();
  const { data } = useData();
  const [eventQueue, setEventQueue] = useState([]);
  const [now, setNow] = useState(new Date());
  const [interacted, setInteracted] = useState(false);
  const [menu, setMenu] = useState(false);
  const [addMenu, setAddMenu] = useState(false);
  const [time, setTime] = useState(0);
  const [firstPlayer, setFirstPlayer] = useState(0);
  const [result, setResult] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const player = {
    first: firstPlayer,
    next: () => setFirstPlayer((fp) => getNextPlayer(sets.heroesCounters, fp)),
    prev: () =>
      setFirstPlayer((fp) => getNextPlayer(sets.heroesCounters, fp, -1)),
    reset: () => setFirstPlayer(0),
    set: (data) => setFirstPlayer(data),
  };

  const CU = useCountersUtils();
  const logger = useLogger();

  const refresh = [logger.entries.length, CU.all.length, CU.activesCount, now];

  const sets = useMemo(() => CU.getSets(), refresh);
  const activeMods = useMemo(() => CU.getModifiers(), refresh);
  const activeIcons = useMemo(() => CU.getActiveIcons(), refresh);
  const mergedLog = useMemo(() => logger.merge(CU.all), refresh);
  const acceleration = getAcceleration(sets.accelerationCounters, activeIcons);
  const isHeroPhase = !!(sets.phasesCounter?.values.value % 2);

  const heroStunned = sets.heroesCounters.some((h) => h.statuses.Stunned);
  const heroConfused = sets.heroesCounters.some((h) => h.statuses.Confused);
  const villainStunned = sets.villainCounters.some((h) => h.statuses.Stunned);
  const villainConfused = sets.villainCounters.some((h) => h.statuses.Confused);

  const triggerToEvent = (counter, trigger) => {
    if (trigger.when) {
      return setEventQueue((ts) => [...ts, { ...trigger, counter }]);
    }

    const dispatchEvent = (data, targets) =>
      dispatch(counter.id, trigger.event, data, targets || trigger.targets);

    const target =
      trigger.targets && CU.getLastActive(CU.getLast(CU.name(trigger.targets)));

    logger.console("trigger", trigger, counter.name, target);

    switch (trigger.event) {
      case EVENTS.DECREASE:
        return dispatchEvent(
          -toValue(trigger.value, setup.settings.players),
          target.id
        );
      case EVENTS.ENTER_SCHEME:
        return new Array(trigger.perPlayer ? +setup.settings.players : 1)
          .fill(data.getSideScheme(trigger.targets))
          .forEach((s) =>
            createCounter(CTYPES.SIDE_SCHEME, trigger.targets, s)
          );
      case EVENTS.ENTER_MAIN_SCHEME:
        return getRandomList(
          trigger.targets,
          trigger.perPlayer ? +setup.settings.players : 1
        ).forEach((s) => dispatchEvent(undefined, s));
      case EVENTS.EMPTY:
      case EVENTS.FLIP_COUNTER:
      case EVENTS.RESET:
        return dispatchEvent(counter.values.value);
      case EVENTS.ENTER_MINION:
        return new Array(trigger.perPlayer ? +setup.settings.players : 1)
          .fill(data.getMinion(trigger.targets))
          .forEach((m) => createCounter(CTYPES.MINION, trigger.targets, m));
      case EVENTS.HIT:
        return dispatchEvent(
          toValue(trigger.value, setup.settings.players),
          target.id
        );
      case EVENTS.INCREASE_FROM:
        return dispatchEvent(CU.name(trigger.value).values.value);
      case EVENTS.HIDE:
        return target.hidden || dispatchEvent();
      case EVENTS.FLIP:
      case EVENTS.FLIP_HERO:
      case EVENTS.FLIP_VILLAIN:
        return dispatchEvent(
          trigger.targets
            ? CU.getTargets(trigger.targets)[0].name
            : counter.name
        );
      default:
        return dispatchEvent(
          trigger.value
            ? toValue(trigger.value, setup.settings.players)
            : trigger.info
        );
    }
  };

  const runCounterTriggers = (counter, event) => {
    return (counter.triggers[event] || []).map((trigger) =>
      triggerToEvent(counter, trigger)
    );
  };

  const isFirstPlayer = (counter) =>
    sets.heroesCounters.findIndex((c) => c.id === counter.id) === firstPlayer;

  const handleDefeat = (counter) => {
    const next = CU.next(counter);
    const triggers = counter.triggers[EVENTS.COMPLETE];

    if (counter.type === CTYPES.HERO && !next && isFirstPlayer(counter)) {
      dispatch(false, EVENTS.FIRST_PLAYER, firstPlayer);
    }

    if (triggers) {
      runCounterTriggers(counter, EVENTS.COMPLETE);
    } else {
      dispatch(counter.id, next ? EVENTS.NEXT : EVENTS.COMPLETE);
    }
  };

  const handleComplete = (counter) => {
    const { advance, min, value } = counter.values;
    const next = CU.next(counter);

    const minAdvance = advance === "min";
    const noneAdvance = advance === "none";
    const canAdvance = minAdvance && value <= min;

    const triggers = counter.triggers[EVENTS.COMPLETE];

    if (triggers) {
      runCounterTriggers(counter, EVENTS.COMPLETE);
    } else if (canAdvance && !next) {
      dispatch(counter.id, EVENTS.COMPLETE);
      endMatch(RESULT_TYPES.SCHEME_WIN);
    } else if (counter.isComplete() && (minAdvance || noneAdvance || !next)) {
      dispatch(counter.id, EVENTS.COMPLETE, minAdvance);
      endMatch(RESULT_TYPES.SCHEME);
    } else {
      dispatch(counter.id, EVENTS.NEXT);
    }
  };

  const endMatch = (reason) => {
    setResult(reason);
    logger.add(time, EVENTS.END, false, reason);
  };

  const restartMatch = () => {
    if (result) {
      handleQuit(result, true);
    } else {
      setLoaded(false);
      CU.set(getCounters(setup, data));
      player.reset();
      setTime(0);
      logger.empty();
      logger.add(time, EVENTS.RESTART);
      setNow(new Date());
    }
  };

  const handleQuit = (reason, replay) =>
    reason
      ? onQuit({ reason, counters: CU.all, time, log: logger.entries }, replay)
      : onQuit(false);

  const disableCounter = (counter, event) => {
    dispatch(counter.id, event || EVENTS.DISABLE, counter.values.value);
    runCounterTriggers(counter, EVENTS.COMPLETE);
  };

  const defeatAlly = (c) => disableCounter(c, EVENTS.ALLY_DEFEATED);
  const defeatMinion = (c) => disableCounter(c, EVENTS.MINION_DEFEATED);
  const sideSchemeCleared = (c) => disableCounter(c, EVENTS.SIDE_CLEARED);

  const createCounter = (type, name, opts) => {
    const counters = CU.createCounter(
      type,
      name || t(type),
      opts,
      setup.settings.players
    );

    const event =
      {
        [CTYPES.ALLY]: EVENTS.ENTER_ALLY,
        [CTYPES.MINION]: EVENTS.ENTER_MINION,
        [CTYPES.SIDE_SCHEME]: EVENTS.ENTER_SCHEME,
        [CTYPES.SUPPORT]: EVENTS.ENTER_SUPPORT,
        [CTYPES.UPGRADE]: EVENTS.ENTER_UPGRADE,
      }[type] || EVENTS.CREATE;

    addNotification(
      t("Counter created", { type: t(name || type) }),
      counters[0].type
    );

    counters.forEach((c) => setTimeout(() => dispatch(c.id, event), 0));
  };

  const runEventQueue = (event) => {
    eventQueue
      .filter((q) => q.when === event)
      .map((t) => triggerToEvent(t.counter, { ...t, when: undefined }));

    setEventQueue((es) => es.filter((q) => q.when !== event));
  };

  const runEvent = (evt) => (counter) => {
    const { event, data, source } = evt.detail;

    switch (event) {
      case EVENTS.LOST_SCHEME:
        return endMatch(RESULT_TYPES.SCHEME);
      case EVENTS.WIN:
        return endMatch(RESULT_TYPES.SCHEME_WIN);
      default:
        break;
    }

    logger.add(time, event, counter?.id, evt.detail, counter?.type);
    setInteracted(true);
    runEventQueue(event);
    if (counter) runCounterTriggers(counter, TRIGGER_MAP[event] || event);

    logger.console("DO", evt.detail, counter?.name);

    switch (event) {
      case EVENTS.NEW_PHASE:
        sets.actives.forEach((c) =>
          runCounterTriggers(c, TRIGGER_MAP[event] || event)
        );
        break;
      default:
        break;
    }

    switch (event) {
      case EVENTS.COMPLETE:
        return !data && CU.disableTree(counter);
      case EVENTS.CREATE:
      case EVENTS.ENTER:
      case EVENTS.ENTER_ALLY:
      case EVENTS.ENTER_MINION:
      case EVENTS.ENTER_SCHEME:
      case EVENTS.ENTER_SUPPORT:
      case EVENTS.ENTER_UPGRADE:
        return counter.enable();
      case EVENTS.ENTER_VILLAIN:
      case EVENTS.ENTER_MAIN_SCHEME:
        counter.enable();
        return counter.show();
      case EVENTS.HIDE:
        return counter.hide();
      case EVENTS.DECREASE:
      case EVENTS.HIT:
      case EVENTS.INCREASE:
      case EVENTS.INCREASE_FROM:
      case EVENTS.VILLAIN_PHASE:
        counter.add(data);
        if (counter.autocomplete && counter.isComplete()) {
          dispatch(counter.id, EVENTS.COMPLETE);
        }
        return;
      case EVENTS.NEW_PHASE:
        const acc = getAcceleration(sets.accelerationCounters, activeIcons);
        sets.mainScheme
          .filter((s) => s.active)
          .map((s) =>
            dispatch(s.id, EVENTS.VILLAIN_PHASE, s.values.step + acc)
          );
        scrollToId("main-schemes");
        return counter.add(data);
      case EVENTS.DECREASE_LIMIT:
      case EVENTS.INCREASE_LIMIT:
        return counter.addMax(data);
      case EVENTS.DISABLE:
      case EVENTS.ALLY_DEFEATED:
      case EVENTS.MINION_DEFEATED:
      case EVENTS.SIDE_CLEARED:
        // counter.reset();
        return counter.disable();
      case EVENTS.EMPTY:
        return counter.empty();
      case EVENTS.FLIP:
      case EVENTS.FLIP_HERO:
      case EVENTS.FLIP_VILLAIN:
        return counter.flip();
      case EVENTS.FLIP_COUNTER:
        CU.id(source).reset();
        CU.id(source).disable();
        return counter.enable();
      case EVENTS.LOCK:
        return counter.lock();
      case EVENTS.FIRST_PLAYER:
        return player.next();
      case EVENTS.NEW_ROUND:
        scrollToId("heroes");
        player.next();
        sets.roundsCounter.add();
        return counter.add(1);
      case EVENTS.NEXT:
        return CU.advance(counter, runCounterTriggers);
      case EVENTS.RESET:
        return counter.reset();
      case EVENTS.STATUS_DISABLE:
        return counter.disableStatus(data);
      case EVENTS.STATUS_ENABLE:
        return counter.enableStatus(data);
      case EVENTS.UNLOCK:
        return counter.unlock();

      default:
        break;
    }
  };

  const undoEvent = () => {
    if (logger.entries.length <= 1) return;
    const isEnd = logger.entries[0].event === EVENTS.END;
    const { entity, event, info } = logger.entries[isEnd ? 1 : 0];
    if (isEnd) {
      setResult(false);
      logger.remove();
    }
    const counter = CU.all.find((c) => c.id === entity);
    logger.remove();

    logger.console("UNDO", info, counter?.name);

    switch (event) {
      case EVENTS.COMPLETE:
        return CU.enableTree(counter);
      case EVENTS.CREATE:
      case EVENTS.ENTER_ALLY:
      case EVENTS.ENTER_MINION:
      case EVENTS.ENTER_SCHEME:
      case EVENTS.ENTER_SUPPORT:
      case EVENTS.ENTER_UPGRADE:
        return CU.remove(counter);
      case EVENTS.DECREASE:
      case EVENTS.HIT:
      case EVENTS.INCREASE:
      case EVENTS.INCREASE_FROM:
      case EVENTS.NEW_PHASE:
      case EVENTS.VILLAIN_PHASE:
        return counter.remove(info.data);
      case EVENTS.DECREASE_LIMIT:
      case EVENTS.INCREASE_LIMIT:
        return counter.removeMax(info.data);
      case EVENTS.DISABLE:
      case EVENTS.ALLY_DEFEATED:
      case EVENTS.MINION_DEFEATED:
      case EVENTS.SIDE_CLEARED:
        if (!isNaN(info.data)) counter.set(info.data);
        return counter.enable();
      case EVENTS.EMPTY:
      case EVENTS.RESET:
        return counter.set(info.data);
      case EVENTS.ENTER:
        return counter.disable();
      case EVENTS.HIDE:
        return counter.show();
      case EVENTS.ENTER_VILLAIN:
      case EVENTS.ENTER_MAIN_SCHEME:
        counter.hide();
        return counter.disable();
      case EVENTS.FLIP:
      case EVENTS.FLIP_HERO:
      case EVENTS.FLIP_VILLAIN:
        return counter.flip();
      case EVENTS.FLIP_COUNTER:
        CU.id(info.source).enable(info.data);
        return counter.disable();
      case EVENTS.LOCK:
        return counter.unlock();
      case EVENTS.FIRST_PLAYER:
        return player.prev();
      case EVENTS.NEW_ROUND:
        player.prev();
        sets.roundsCounter.remove();
        return counter.remove(1);
      case EVENTS.NEXT:
        return CU.back(counter);
      case EVENTS.STATUS_DISABLE:
        return counter.enableStatus(info.data);
      case EVENTS.STATUS_ENABLE:
        return counter.disableStatus(info.data);
      case EVENTS.UNLOCK:
        return counter.lock();

      default:
        return false;
    }
  };

  useEffect(() => {
    load(STORAGE_KEYS.CURRENT).then((saved) => {
      if (saved) {
        setResult(saved.result || false);
        CU.set(saved.counters.map((c) => new CounterObj(c)));
        setTime(saved.time);
        setFirstPlayer(saved.firstPlayer);
        setEventQueue(saved.eventQueue);
        logger.set(saved.log.map((l) => ({ ...l, date: new Date(l.date) })));
        setLoaded(true);
      } else {
        CU.set(getCounters(setup, data));
        logger.add(time, EVENTS.START);
        setNow(new Date());
      }
    });
  }, [setup]);

  useEffect(() => {
    if (CU.all && !result) {
      if (sets.heroesCounters.every(isNotActive))
        endMatch(RESULT_TYPES.DEFEATED);
      if (sets.villainCounters.every(isNotActive))
        endMatch(RESULT_TYPES.WINNER);
    }
  }, [CU.activesCount]);

  useEffect(() => {
    if (!loaded && logger.entries.length === 1) {
      setTimeout(
        () =>
          CU.getSets().actives.forEach((c) =>
            runCounterTriggers(c, EVENTS.ENTER)
          ),
        0
      );
      setLoaded(true);
    }
  }, [logger.entries.length, now]);

  useEffect(() => {
    const className = `is-${
      isHeroPhase || !sets.phasesCounter ? "hero" : "villain"
    }-phase`;
    document.body.classList.add(className);
    return () => document.body.classList.remove(className);
  }, [isHeroPhase, CU.all.length]);

  useEffect(() => {
    const te = (event) => {
      logger.console("listener", event.detail);
      if (event.detail.targets) {
        CU.getTargets(event.detail.targets).map(runEvent(event));
      } else {
        runEvent(event)(false);
      }
      setNow(new Date());
    };

    document.addEventListener("trigger", te);
    return () => document.removeEventListener("trigger", te);
  }, [logger.entries.length, CU.all.length, CU.activesCount]);

  useEffect(() => {
    if (interacted && window.navigator.vibrate) window.navigator.vibrate(50);
    if (CU.all) {
      persist(STORAGE_KEYS.CURRENT, {
        counters: CU.all,
        eventQueue,
        firstPlayer,
        log: logger.entries,
        matchId,
        result,
        setup,
        time,
      });
    }
  }, [logger.entries.length, now]);

  logger.console(sets);

  return (
    !!CU.all && (
      <div>
        <MatchMenu
          canRestart={!result && mergedLog.length <= 1}
          onClose={() => setMenu(false)}
          onQuit={handleQuit}
          open={menu}
          restartMatch={restartMatch}
          result={result}
        />

        <AddCounter
          open={addMenu}
          onClose={() => setAddMenu(false)}
          createCounter={createCounter}
          sets={sets}
        />

        <div className="box__wrapper" id="heroes">
          {sets.heroesCounters.map((counter, i) => (
            <CounterBox
              logger={logger}
              result={result}
              counters={[counter]}
              heroPhase={isHeroPhase}
              highlight={player.first === i}
              key={counter.id}
              lastLabel="💀"
              mods={activeMods}
              onComplete={handleDefeat}
              siblings={CU.all.filter(childOf(counter))}
              nextWarning={villainStunned && "stunned"}
            />
          ))}
          {!!byNameAndParent(sets.allyCounters.filter(isActive)).length && (
            <Box key="Allies" title="Allies" type="ally">
              {byNameAndParent(sets.allyCounters.filter(isActive)).map(
                (counter) => (
                  <Counter
                    counter={counter}
                    heroPhase={isHeroPhase}
                    key={counter.id}
                    onComplete={defeatAlly}
                    title={counter.name}
                    logger={logger}
                    result={result}
                    nextWarning={villainStunned && "stunned"}
                  />
                )
              )}
            </Box>
          )}
          {!!sets.extraCounters.filter(isActive).length && (
            <Box key="Extra" type="extra">
              {sets.extraCounters
                .filter(isActive)
                .sort(byName)
                .map((counter) => (
                  <Counter
                    counter={counter}
                    heroPhase={isHeroPhase}
                    key={counter.id}
                    onComplete={disableCounter}
                    title={counter.name}
                    logger={logger}
                    result={result}
                  />
                ))}
            </Box>
          )}
        </div>
        <div className="box__wrapper">
          <CounterBox
            logger={logger}
            result={result}
            heroPhase={isHeroPhase}
            counters={sets.villainCounters}
            nextWarning={heroStunned && "stunned"}
            lastLabel="💀"
            mods={activeMods}
            onComplete={handleDefeat}
            siblings={sets.villainCounters
              .map((counter) => CU.ofChain(counter))
              .flat()}
            title={sets.villainCounters.length > 1 ? "Villains" : false}
          />
          {!!sets.minionCounters.filter(isActive).length && (
            <Box key="Minions" title={t("Minions")} type="minion">
              {sets.minionCounters
                .filter(isActive)
                .sort(byName)
                .map((counter) => (
                  <Counter
                    counter={counter}
                    heroPhase={isHeroPhase}
                    key={counter.id}
                    onComplete={defeatMinion}
                    title={counter.name}
                    logger={logger}
                    result={result}
                    nextWarning={heroStunned && "stunned"}
                  />
                ))}
            </Box>
          )}
        </div>
        <div className="box__wrapper" id="main-schemes">
          <CounterBox
            acceleration={acceleration}
            logger={logger}
            result={result}
            heroPhase={isHeroPhase}
            counters={sets.mainScheme}
            onComplete={handleComplete}
            siblings={sets.mainScheme
              .map((counter) =>
                CU.ofChain(counter).filter(isLast).map(CU.getLastActive)
              )
              .flat()}
            title={sets.mainScheme.length > 1 ? "Main scheme" : false}
            nextWarning={villainConfused && "confused"}
            prevWarning={heroConfused && "confused"}
            type="scenario"
          />
          {!!sets.sideSchemes.filter(isActive).length && (
            <Box key="Side schemes" title={t("Side schemes")} type="scheme">
              {sets.sideSchemes.filter(isActive).map((counter) => (
                <Counter
                  counter={counter}
                  heroPhase={isHeroPhase}
                  key={counter.id}
                  onComplete={sideSchemeCleared}
                  title={counter.name}
                  prevWarning={heroConfused && "confused"}
                  logger={logger}
                  result={result}
                />
              ))}
            </Box>
          )}
        </div>
        <div className="box__wrapper">
          {!!sets.customCounters.filter(isActive).length && (
            <Box key="Custom" title={t("Custom counters")} type="extra">
              {sets.customCounters
                .filter(isActive)
                .sort(byName)
                .map((counter) => (
                  <Counter
                    counter={counter}
                    heroPhase={isHeroPhase}
                    key={counter.id}
                    onComplete={disableCounter}
                    title={counter.name}
                    logger={logger}
                    result={result}
                  />
                ))}
            </Box>
          )}
        </div>
        <div className="box__wrapper">
          <Box key="Log" title="Log">
            {mergedLog.map((entry, i) => (
              <LogItem
                key={
                  i === logger.entries.length - 1
                    ? entry.date
                    : logger.entries.length - i
                }
                time={getEntryTime(entry)}
                text={<LogString {...entry} />}
              />
            ))}
          </Box>
        </div>
        <Timer
          disabled={result || menu}
          interacted={interacted}
          onChange={setTime}
          time={time}
        />

        <Navbar types={result && ["result", result]}>
          {result ? (
            t(getResText(result))
          ) : (
            <Report
              heroes={sets.heroesCounters}
              icons={activeIcons}
              mainScheme={sets.mainScheme}
              phasesCounter={sets.phasesCounter}
              roundsCounter={sets.roundsCounter}
              villains={sets.villainCounters}
            />
          )}
          <Actions>
            <Action
              label={t("Undo")}
              disabled={mergedLog.length <= 1}
              sublabel={<LogItem text={<LogString {...mergedLog[0]} />} />}
              onClick={() => undoEvent()}
            />
            <Action
              label={t("Add")}
              sublabel={t("Counter")}
              onClick={() => setAddMenu(true)}
            />
            <Action
              label={t(result ? "Exit" : "Menu")}
              onClick={() => (result ? handleQuit(result) : setMenu(true))}
            />
          </Actions>
        </Navbar>
      </div>
    )
  );
}
