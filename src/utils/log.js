import { useState } from "react";
import { useTranslation } from "react-i18next";

import { msToTime } from ".";
import { EVENTS } from "./constants";
import {
  getAddTokenText,
  getCompleteText,
  getRemoveTokenText,
  getResText,
  getStageName,
  getStatusName,
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

export const LogString = ({ count = 0, counter, info, event }) => {
  const { t } = useTranslation();

  switch (event) {
    case EVENTS.COMPLETE:
      return (
        <>
          {getStageName(counter)}: {getCompleteText(counter.type)}
        </>
      );
    case EVENTS.CREATE:
    case EVENTS.ENTER_ALLY:
    case EVENTS.ENTER_MINION:
    case EVENTS.ENTER_SUPPORT:
    case EVENTS.ENTER_UPGRADE:
    case EVENTS.ENTER:
    case EVENTS.ENTER_SCHEME:
    case EVENTS.FLIP_COUNTER:
      return (
        <>
          {getStageName(counter)}: {t("Entered")}
        </>
      );
    case EVENTS.DECREASE:
      return (
        <>
          {getStageName(counter)}: {getRemoveTokenText(counter.type, -count)}
        </>
      );
    case EVENTS.DECREASE_LIMIT:
      return (
        <>
          {getStageName(counter)}: {t("Decreased limit", { count: -count })}
        </>
      );
    case EVENTS.ALLY_DEFEATED:
    case EVENTS.MINION_DEFEATED:
      return (
        <>
          {getStageName(counter)}: {t("Defeated")}
        </>
      );
    case EVENTS.SIDE_CLEARED:
      return (
        <>
          {getStageName(counter)}: {t("Cleared")}
        </>
      );
    case EVENTS.DISABLE:
      return (
        <>
          {getStageName(counter)}: {t("Disabled")}
        </>
      );
    case EVENTS.EMPTY:
      return (
        <>
          {getStageName(counter)}: {t("Empty")}
        </>
      );
    case EVENTS.RESET:
      return (
        <>
          {getStageName(counter)}: {t("Reset")}
        </>
      );
    case EVENTS.LOCK:
      return (
        <>
          {getStageName(counter)}: {t("Locked")}
        </>
      );
    case EVENTS.UNLOCK:
      return (
        <>
          {getStageName(counter)}: {t("Unlocked")}
        </>
      );
    case EVENTS.FLIP:
    case EVENTS.FLIP_HERO:
    case EVENTS.FLIP_VILLAIN:
      return (
        <>
          {getStageName(counter, info.data)}: {t("Flipped")}
        </>
      );
    case EVENTS.END:
      return `🟣 ${getResText(info)}`;
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
          {getStageName(counter)}: {t("Increased limit", { count })}
        </>
      );
    case EVENTS.FIRST_PLAYER:
      return `❗️ ${t("First player")}`;
    case EVENTS.NEW_PHASE:
      return `🔴 ${t("Villain phase")}`;
    case EVENTS.NEW_ROUND:
      return `🔵 ${t("New round")}`;
    case EVENTS.NEXT:
      return (
        <>
          {getStageName(counter)}: {t("Next stage")}
        </>
      );
    case EVENTS.RESTART:
      return `🟢 ${t("Match restarted")}`;
    case EVENTS.START:
      return `🟢 ${t("Match started")}`;
    case EVENTS.STATUS_DISABLE:
      return t("is no more", {
        name: getStageName(counter),
        status: getStatusName(info.data, t),
      });
    case EVENTS.STATUS_ENABLE:
      return t("is", {
        name: getStageName(counter),
        status: getStatusName(info.data, t),
      });
    case EVENTS.VILLAIN_PHASE:
      return (
        <>
          {getStageName(counter)}: {getAddTokenText(counter.type, count)}
        </>
      );

    default:
      return event || null;
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
