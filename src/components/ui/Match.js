import React from "react";
import "../../styles/match.css";
import { msToTime } from "../../utils";
import { resultText } from "../../utils/texts";
import { getMatchTime } from "../Statistics";
import Dot from "./Dot";

export default function Match({ match, onDelete, onReplay }) {
  const matchTime = getMatchTime(match);

  return (
    <div className="match">
      <div>
        <div>
          {(match.setup.heroesAndAspects || match.setup.heroes).map((h) => (
            <React.Fragment key={h.name}>
              <span>{h.name}</span>{" "}
              {h.aspects.map((a) => (
                <Dot key={a} type={a.toLowerCase()} small />
              ))}
            </React.Fragment>
          ))}
        </div>
        <div>
          <span className="match__vs">VS</span>{" "}
          {match.setup.scenarioName || match.setup.scenario.name}{" "}
          <small className="match__mode">[{match.setup.mode}]</small>
        </div>
        <div>
          {resultText(match.reason)}
          {matchTime ? ` in ${msToTime(matchTime)}` : ""}
        </div>
      </div>
      <div className="match__info">
        <small className="match__date">
          {new Date(match.date).toLocaleDateString()}
        </small>
        <small className="match__date">
          {new Date(match.date).toLocaleTimeString().slice(0, -3)}
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
