const getLogString = (entry) => {
  if (entry.start) return "Match started";
  const token =
    {
      "modular-scheme": "thread",
      "nemesis-scheme": "thread",
      "side-scheme": "thread",
      scenario: "thread",
      hero: "hit",
      villain: "hit",
    }[entry.counterType] || "token";
  const completeText =
    {
      hero: "Defeated",
      "modular-scheme": "Cleared",
      "nemesis-scheme": "Cleared",
      "side-scheme": "Cleared",
      villain: "Defeated",
    }[entry.counterType] || "Complete";

  if (entry.result) return entry.resultText;
  if (entry.complete) return `${entry.stageName} | ${completeText}`;
  if (entry.enter) return `${entry.stageName} | Entered`;

  switch (`${entry.stageOffset}${entry.valueOffset}${entry.limitOffset}`) {
    case "100":
      return `${entry.stageName} | Next stage`;
    case "-100":
      return `${entry.stageName} | Previous stage`;
    case "010":
      return `${entry.stageName} | Added ${token}`;
    case "0-10":
      return `${entry.stageName} | Removed ${token}`;
    case "001":
      return `${entry.stageName} | Increased limit`;
    case "00-1":
      return `${entry.stageName} | Limit decreased`;

    default:
      return "";
  }
};

export default function Log({ log }) {
  return (
    <div className="box box--flat box--flag">
      <div className="box__title">Log</div>
      <div className="box__content log">
        {log.map((entry) => (
          <div key={entry.id}>
            {entry.date.toLocaleTimeString()}: {getLogString(entry)}
          </div>
        ))}
      </div>
    </div>
  );
}
