import React from "react";
import { ReactComponent as AccelerationImg } from "../../images/acceleration.svg";
import { ReactComponent as AmplifyImg } from "../../images/amplify.svg";
import { ReactComponent as CrisisImg } from "../../images/crisis.svg";
import { ReactComponent as HazardImg } from "../../images/hazard.svg";
import "../../styles/report.css";
import { getClassName } from "../../utils";
import { getLogString } from "../../utils/log";
import LogItem from "./LogItem";

const iconsImages = {
  Acceleration: <AccelerationImg />,
  Amplify: <AmplifyImg />,
  Hazard: <HazardImg />,
  Crisis: <CrisisImg />,
};

function Bar({ counter, inverse, revert }) {
  const stage = counter.levels[counter.stage];

  const val = inverse ? stage.value : stage.limit - stage.value;

  const classList = [
    "report__bar",
    `is-${counter.type}`,
    revert && "is-revert",
  ];

  return (
    <div
      className={getClassName(classList)}
      key={stage.name}
      style={{ "--val": val / stage.limit }}
    />
  );
}

export default function Report({
  heroes,
  icons,
  log,
  mainScheme,
  nextRound,
  round,
  villains,
}) {
  return (
    <div className="report">
      <div className="report__progress">
        <div>
          {heroes.map((h) => (
            <Bar key={h.id} counter={h} />
          ))}
        </div>
        <div>
          {villains.map((v) => (
            <Bar key={v.id} counter={v} revert />
          ))}
          <Bar counter={mainScheme} revert inverse />
        </div>
      </div>
      <div>
        <span className="report__btn" onClick={nextRound}>
          +
        </span>{" "}
        Round {round}
      </div>
      <div className="report__icons">
        {(icons || []).map((icon, i) => (
          <React.Fragment key={i}>{iconsImages[icon]}</React.Fragment>
        ))}
      </div>
      <div className="report__log">
        {log.slice(0, 7).map((entry, i) => (
          <LogItem key={log.length - i} text={getLogString(entry)} />
        ))}
      </div>
    </div>
  );
}
