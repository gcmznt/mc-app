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
      current.event !== EVENTS.STATUS_DISABLE &&
      current.event !== EVENTS.STATUS_ENABLE &&
      current.entity
    ) {
      const list = [...acc];
      const last = list.pop();
      return [
        ...list,
        { ...last, counter, count: last.count + (current.data || 1) },
      ];
    } else {
      return [...acc, { ...current, counter, count: current.data || 1 }];
    }
  }, []);
}

export const getEntryTime = (entry) => {
  switch (entry.event) {
    case EVENTS.NEW_ROUND:
    case EVENTS.VILLAIN_PHASE:
    case EVENTS.END:
      return entry.time;
    case EVENTS.START:
    case EVENTS.RESTART:
      return entry.date;

    default:
      return "";
  }
};

export const getLogString = ({ count = 0, counter, data, event }) => {
  switch (event) {
    case EVENTS.COMPLETE:
      return (
        <>
          {getStageName(counter)}: {getCompleteText(counter.type)}
        </>
      );
    case EVENTS.DECREASE:
      return (
        <>
          {getStageName(counter)}: {getRemoveTokenText(counter.type, count)}
        </>
      );
    case EVENTS.DEC_LIMIT:
      return (
        <>
          {getStageName(counter)}: {getDecreaseText(count)}
        </>
      );
    case EVENTS.DISABLE:
      return <>{getStageName(counter)}: Disabled</>;
    case EVENTS.END:
      return `---- ${getResText(data)} ----`;
    case EVENTS.ENTER:
      return <>{getStageName(counter)}: Entered</>;
    case EVENTS.INCREASE:
      return (
        <>
          {getStageName(counter)}: {getAddTokenText(counter.type, count)}
        </>
      );
    case EVENTS.INC_LIMIT:
      return (
        <>
          {getStageName(counter)}: {getIncreaseText(count)}
        </>
      );
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
          <span className={`is-${data.toLowerCase()}`}>{data}</span>
        </>
      );
    case EVENTS.STATUS_ENABLE:
      return (
        <>
          {getStageName(counter)} is{" "}
          <span className={`is-${data.toLowerCase()}`}>{data}</span>
        </>
      );
    case EVENTS.VILLAIN_PHASE:
      return `---- Villain phase: ${getAddTokenText(counter.type, data)}`;

    default:
      return event;
  }
};
