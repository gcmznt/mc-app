import Box from "./ui/Box";

export const EVENTS = {
  COMPLETE: "complete",
  DECREASE: "decrease",
  DECREASELIMIT: "decreaseLimit",
  END: "end",
  ENTER: "enter",
  INCREASE: "increase",
  INCREASELIMIT: "increaseLimit",
  NEXT: "next",
  PREVIOUS: "previous",
  RESTART: "restart",
  START: "start",
};

const getTokenCount = (type, count) => {
  const tokenName =
    {
      "modular-scheme": "thread",
      "nemesis-scheme": "thread",
      "side-scheme": "thread",
      scenario: "thread",
    }[type] || "token";

  if (!count) return tokenName;
  if (count === 1) return `1 ${tokenName}`;
  return `${count} ${tokenName}s`;
};

const getAddTokenText = (type, count) =>
  ({
    hero: `Hitted${count > 1 ? ` x ${count}` : ""}`,
    villain: `Hitted${count > 1 ? ` x ${count}` : ""}`,
  }[type] || `Added ${getTokenCount(type, count)}`);

const getRemoveTokenText = (type, count) =>
  ({
    hero: `Healed${count > 1 ? ` x ${count}` : ""}`,
    villain: `Healed${count > 1 ? ` x ${count}` : ""}`,
  }[type] || `Removed ${getTokenCount(type, count)}`);

const getCompleteText = (type) =>
  ({
    hero: "Defeated",
    "modular-scheme": "Cleared",
    "nemesis-scheme": "Cleared",
    "side-scheme": "Cleared",
    villain: "Defeated",
  }[type] || "Complete");

const getStageName = (counter) => counter.levels[counter.stage][0];

const getLogString = ({ count = 0, data, event }) => {
  switch (event) {
    case EVENTS.COMPLETE:
      return `${getStageName(data)} | ${getCompleteText(data.type)}`;
    case EVENTS.DECREASE:
      return `${getStageName(data)} | ${getRemoveTokenText(data.type, count)}`;
    case EVENTS.DECREASELIMIT:
      return `${getStageName(data)} | Limit decreased`;
    case EVENTS.END:
      return data.resultText;
    case EVENTS.ENTER:
      return `${getStageName(data)} | Entered`;
    case EVENTS.INCREASE:
      return `${getStageName(data)} | ${getAddTokenText(data.type, count)}`;
    case EVENTS.INCREASELIMIT:
      return `${getStageName(data)} | Increased limit`;
    case EVENTS.NEXT:
      return `${getStageName(data)} | Next stage`;
    case EVENTS.PREVIOUS:
      return `${getStageName(data)} | Previous stage`;
    case EVENTS.RESTART:
      return "Match restarted";
    case EVENTS.START:
      return "Match started";

    default:
      return "";
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
