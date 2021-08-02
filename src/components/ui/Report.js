import React from "react";
import { ReactComponent as AccelerationImg } from "../../images/acceleration.svg";
import { ReactComponent as AmplifyImg } from "../../images/amplify.svg";
import { ReactComponent as CrisisImg } from "../../images/crisis.svg";
import { ReactComponent as HazardImg } from "../../images/hazard.svg";
import "../../styles/report.css";

const iconsImages = {
  Acceleration: <AccelerationImg />,
  Amplify: <AmplifyImg />,
  Hazard: <HazardImg />,
  Crisis: <CrisisImg />,
};

function Bar({ counter, inverse, revert }) {
  const val = inverse
    ? counter.levels[counter.stage].value
    : counter.levels[counter.stage].limit - counter.levels[counter.stage].value;
  return (
    <div
      className={`report__bar is-${counter.type} ${revert ? "is-revert" : ""}`}
      key={counter.levels[counter.stage].name}
      style={{ "--val": val / counter.levels[counter.stage].limit }}
    />
  );
}

export default function Report({
  heroes,
  icons,
  mainScheme,
  nextRound,
  result,
  round,
  villains,
}) {
  return result ? (
    result
  ) : (
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
    </div>
  );
}
