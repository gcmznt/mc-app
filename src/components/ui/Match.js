import "../../styles/match.css";

export default function Match({ match, onDelete, onReplay }) {
  console.log(match);
  return (
    <div className="match">
      <div>
        <div>{match.heroes.join(" + ")}</div>
        <div>
          <span className="match__vs">VS</span> {match.scenario}{" "}
          <small className="match__mode">[{match.mode}]</small>
        </div>
        <div>{match.result}</div>
      </div>
      <div className="match__info">
        <small className="match__date">{match.date.toLocaleDateString()}</small>
        <small className="match__date">
          {match.date.toLocaleTimeString().slice(0, -3)}
        </small>
        <span className="match__delete" onClick={() => onDelete(match)}>
          Delete
        </span>{" "}
        |{" "}
        <span className="match__delete" onClick={() => onReplay(match)}>
          Replay
        </span>
      </div>
    </div>
  );
}
