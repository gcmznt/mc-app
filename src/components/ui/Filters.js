import "../../styles/filters.css";
import { FILTERS } from "../../utils/constants";
import { resultText } from "../../utils/texts";

export default function Filters({ filters, onToggle }) {
  return filters.length ? (
    <div className="filters">
      Filters:
      {filters.map((f) => (
        <span
          key={f[0] + f[1]}
          className={`filters__element is-${f[0]}`}
          onClick={() => onToggle(f)}
        >
          {f[0] === FILTERS.RESULT ? resultText(f[1]) : f[1]}
          {f[0] === FILTERS.PLAYERS && ` player${f[1] === "1" ? "" : "s"}`}
        </span>
      ))}
    </div>
  ) : null;
}
