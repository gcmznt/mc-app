import { useState } from "react";
import { msToTime } from ".";
import { EVENTS } from "./constants";
import {
  getAddTokenText,
  getCompleteText,
  getDecreaseText,
  getIncreaseText,
  getRemoveTokenText,
  getResText,
  getStageName,
} from "./texts";

export function mergeLog(counters, log) {
  return log.reduce((acc, current) => {
    const counter = counters.find((c) => c.id === current.entity);

    if (
      acc.length &&
      acc[acc.length - 1].event === current.event &&
      acc[acc.length - 1].entity === current.entity &&
      current.event !== EVENTS.VILLAIN_PHASE &&
      current.event !== EVENTS.NEW_ROUND &&
      current.event !== EVENTS.NEW_PHASE &&
      current.event !== EVENTS.STATUS_DISABLE &&
      current.event !== EVENTS.STATUS_ENABLE &&
      current.entity
    ) {
      const list = [...acc];
      const last = list.pop();
      return [
        ...list,
        { ...last, counter, count: last.count + (current.info?.data || 1) },
      ];
    } else {
      return [...acc, { ...current, counter, count: current.info?.data || 1 }];
    }
  }, []);
}

export const getEntryTime = (entry) => {
  switch (entry.event) {
    case EVENTS.NEW_ROUND:
    case EVENTS.NEW_PHASE:
    case EVENTS.END:
      return `+ ${msToTime(entry.time)}`;
    case EVENTS.START:
    case EVENTS.RESTART:
      return entry.date.toLocaleTimeString();

    default:
      return false;
  }
};

export const getLogString = ({ count = 0, counter, info, event }) => {
  switch (event) {
    case EVENTS.COMPLETE:
      return (
        <>
          {getStageName(counter)}: {getCompleteText(counter.type)}
        </>
      );
    case EVENTS.CREATE:
    case EVENTS.ENTER:
    case EVENTS.ENTER_SCHEME:
    case EVENTS.FLIP_COUNTER:
      return <>{getStageName(counter)}: Entered</>;
    case EVENTS.DECREASE:
      return (
        <>
          {getStageName(counter)}: {getRemoveTokenText(counter.type, -count)}
        </>
      );
    case EVENTS.DECREASE_LIMIT:
      return (
        <>
          {getStageName(counter)}: {getDecreaseText(-count)}
        </>
      );
    case EVENTS.DISABLE:
      return <>{getStageName(counter)}: Disabled</>;
    case EVENTS.EMPTY:
      return <>{getStageName(counter)}: Empty</>;
    case EVENTS.RESET:
      return <>{getStageName(counter)}: Reset</>;
    case EVENTS.LOCK:
      return <>{getStageName(counter)}: Locked</>;
    case EVENTS.UNLOCK:
      return <>{getStageName(counter)}: Unlocked</>;
    case EVENTS.END:
      return `---- ${getResText(info)} ----`;
    case EVENTS.HIT:
    case EVENTS.INCREASE:
    case EVENTS.INCREASE_FROM:
      return (
        <>
          {getStageName(counter)}: {getAddTokenText(counter.type, count)}
        </>
      );
    case EVENTS.INCREASE_LIMIT:
      return (
        <>
          {getStageName(counter)}: {getIncreaseText(count)}
        </>
      );
    case EVENTS.NEW_PHASE:
      return "---- Villain phase ----";
    case EVENTS.NEW_ROUND:
      return "---- New round ----";
    case EVENTS.NEXT:
      return <>{getStageName(counter)}: Next stage</>;
    case EVENTS.PREVIOUS:
      return <>{getStageName(counter)}: Previous stage</>;
    case EVENTS.RESTART:
      return "---- Match restarted ----";
    case EVENTS.START:
      return "---- Match started ----";
    case EVENTS.STATUS_DISABLE:
      return (
        <>
          {getStageName(counter)} is no more{" "}
          <span className={`is-${info.data.toLowerCase()}`}>{info.data}</span>
        </>
      );
    case EVENTS.STATUS_ENABLE:
      return (
        <>
          {getStageName(counter)} is{" "}
          <span className={`is-${info.data.toLowerCase()}`}>{info.data}</span>
        </>
      );
    case EVENTS.VILLAIN_PHASE:
      return (
        <>
          {getStageName(counter)}: {getAddTokenText(counter.type, count)}
        </>
      );

    default:
      return event;
  }
};

export function useLogger() {
  const [log, setLog] = useState([]);

  const logger = {
    add: (time, event, entity, info) =>
      logger.prepend({ time, event, entity, info }),
    empty: () => setLog([]),
    entries: log,
    merge: (counters) => mergeLog(counters, log),
    prepend: (log) => setLog((l) => [{ ...log, date: new Date() }, ...l]),
    remove: (count = 1) => setLog((l) => [...l].slice(count)),
    set: (data) => setLog(data),
  };

  return logger;
}
