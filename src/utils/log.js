import { useState } from "react";

import { msToTime } from ".";
import { EVENTS } from "./constants";

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
      current.event !== EVENTS.FLIP &&
      current.event !== EVENTS.FLIP_VILLAIN &&
      current.event !== EVENTS.FLIP_HERO &&
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

export function useLogger() {
  const [log, setLog] = useState([]);

  const logger = {
    add: (time, event, entity, info, type) =>
      logger.prepend({ time, event, entity, info, type }),
    empty: () => setLog([]),
    entries: log,
    merge: (counters) => mergeLog(counters, log),
    prepend: (log) => setLog((l) => [{ ...log, date: new Date() }, ...l]),
    remove: (count = 1) => setLog((l) => [...l].slice(count)),
    set: (data) => setLog(data),
    console: (...args) => {
      if (new URL(document.location).searchParams.get("debug") === "") {
        console.log(...args);
      }
    },
  };

  return logger;
}
