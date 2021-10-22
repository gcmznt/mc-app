import React from "react";
import { ReactComponent as AccelerationImg } from "../../images/acceleration.svg";
import { ReactComponent as AmplifyImg } from "../../images/amplify.svg";
import { ReactComponent as CrisisImg } from "../../images/crisis.svg";
import { ReactComponent as HazardImg } from "../../images/hazard.svg";
import { ReactComponent as AdvanceImg } from "../../images/advance.svg";
import "../../styles/report.css";
import { getClassName } from "../../utils";
import { EVENTS } from "../../utils/constants";
import { dispatch } from "../../utils/events";

const iconsImages = {
  Acceleration: <AccelerationImg />,
  Amplify: <AmplifyImg />,
  Hazard: <HazardImg />,
  Crisis: <CrisisImg />,
};

function Bar({ counter, inverse, revert }) {
  const val = inverse
    ? counter.values.value
    : counter.values.max - counter.values.value;

  const classList = [
    "report__bar",
    `is-${counter.type}`,
    revert && "is-revert",
  ];

  return (
    <div
      className={getClassName(classList)}
      key={counter.name}
      style={{ "--val": val / counter.values.max }}
    />
  );
}

export default function Report({
  heroes,
  icons,
  mainScheme,
  phasesCounter,
  roundsCounter,
  villains,
}) {
  const isHeroPhase = phasesCounter?.values.value % 2;
  const nextRound = () =>
    dispatch(
      phasesCounter.id,
      isHeroPhase ? EVENTS.NEW_PHASE : EVENTS.NEW_ROUND
    );

  return (
    <div className={`report is-${isHeroPhase ? "hero" : "villain"}`}>
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
          {mainScheme.map((v) => (
            <Bar key={v.id} counter={v} revert inverse />
          ))}
        </div>
      </div>
      <div className="report_phase">
        <span>
          Round {roundsCounter?.values.value}:{" "}
          {isHeroPhase ? "Hero" : "Villain"} phase
        </span>
        <span className="report__btn" onClick={nextRound}>
          {isHeroPhase ? <AdvanceImg /> : "»"}
        </span>
      </div>
      <div className="report__icons">
        {(icons || []).map((icon, i) => (
          <React.Fragment key={i}>{iconsImages[icon]}</React.Fragment>
        ))}
      </div>
    </div>
  );
}
