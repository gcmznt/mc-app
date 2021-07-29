import "../../styles/match.css";

export default function Match({ match, onDelete }) {
  return (
    <div className="match">
      <div>
        <div>{match.heroes.join(" + ")}</div>
        <div>
          <span className="match__vs">VS</span> {match.scenario}
        </div>
        <div>{match.result}</div>
      </div>
      <div className="match__info">
        <small className="match__date">{match.date.toLocaleDateString()}</small>
        <small className="match__date">
          {match.date.toLocaleTimeString().slice(0, -3)}
        </small>
        <span className="match__delete" onClick={() => onDelete(match)}>
          delete
        </span>
      </div>
    </div>
  );
}
