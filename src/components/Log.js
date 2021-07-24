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
      return `${getStageName(data)} | ${getCompleteText(data.type)}`;
    case EVENTS.DECREASE:
      return `${getStageName(data)} | ${getRemoveTokenText(data.type, count)}`;
    case EVENTS.DECREASE_LIMIT:
      return `${getStageName(data)} | ${getDecreaseText(count)}`;
    case EVENTS.END:
      return data.resultText;
    case EVENTS.ENTER:
      return `${getStageName(data)} | Entered`;
    case EVENTS.INCREASE:
      return `${getStageName(data)} | ${getAddTokenText(data.type, count)}`;
    case EVENTS.INCREASE_LIMIT:
      return `${getStageName(data)} | ${getIncreaseText(count)}`;
    case EVENTS.NEXT:
      return `${getStageName(data)} | Next stage`;
    case EVENTS.PREVIOUS:
      return `${getStageName(data)} | Previous stage`;
    case EVENTS.RESTART:
      return "Match restarted";
    case EVENTS.START:
      return "Match started";

    default:
      return event;
  }
};

function mergeLog(log) {
  return log.reduce((a, c) => {
    if (
      a.length &&
      a[a.length - 1].event === c.event &&
      a[a.length - 1].entity === c.entity
    ) {
      const list = [...a];
      const last = list.pop();
      return [...list, { ...last, count: last.count + 1 }];
    } else {
      return [...a, { ...c, count: 1 }];
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
