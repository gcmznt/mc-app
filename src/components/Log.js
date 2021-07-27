import { EVENTS } from "../utils/constants";
import {
  getAddTokenText,
  getCompleteText,
  getDecreaseText,
  getIncreaseText,
  getRemoveTokenText,
  getStageName,
} from "../utils/texts";
import Box from "./ui/Box";

const getLogString = ({ count = 0, data, event }) => {
  switch (event) {
    case EVENTS.COMPLETE:
      return `${getStageName(data.counter)} | ${getCompleteText(
        data.counter.type
      )}`;
    case EVENTS.DECREASE:
      return `${getStageName(data.counter)} | ${getRemoveTokenText(
        data.counter.type,
        count
      )}`;
    case EVENTS.DEC_LIMIT:
      return `${getStageName(data.counter)} | ${getDecreaseText(count)}`;
    case EVENTS.DISABLE:
      return `${getStageName(data.counter)} | Disabled`;
    case EVENTS.END:
      return data.resultText;
    case EVENTS.ENTER:
      return `${getStageName(data.counter)} | Entered`;
    case EVENTS.INCREASE:
      return `${getStageName(data.counter)} | ${getAddTokenText(
        data.counter.type,
        count
      )}`;
    case EVENTS.INC_LIMIT:
      return `${getStageName(data.counter)} | ${getIncreaseText(count)}`;
    case EVENTS.NEXT:
      return `${getStageName(data.counter)} | Next stage`;
    case EVENTS.PREVIOUS:
      return `${getStageName(data.counter)} | Previous stage`;
    case EVENTS.RESTART:
      return "Match restarted";
    case EVENTS.START:
      return "Match started";
    case EVENTS.STATUS_DISABLE:
      return `${data.name} is no more ${data.status}`;
    case EVENTS.STATUS_ENABLE:
      return `${data.name} is ${data.status}`;
    case EVENTS.VILLAIN_PHASE:
      return `Villain phase | ${getAddTokenText(data.counter.type, data.val)}`;

    default:
      return event;
  }
};

function mergeLog(log) {
  return log.reduce((a, c) => {
    if (
      a.length &&
      a[a.length - 1].event === c.event &&
      a[a.length - 1].entity === c.entity &&
      a[a.length - 1].event !== EVENTS.VILLAIN_PHASE &&
      a[a.length - 1].entity
    ) {
      const list = [...a];
      const last = list.pop();
      return [...list, { ...last, count: last.count + (c.data.val || 1) }];
    } else {
      return [...a, { ...c, count: c.data?.val || 1 }];
    }
  }, []);
}

export default function Log({ log }) {
  return (
    <Box title="Log" flat flag type="log">
      {mergeLog(log).map((entry) => (
        <div key={entry.id}>
          {entry.date.toLocaleTimeString()}: {getLogString(entry)}
        </div>
      ))}
    </Box>
  );
}
