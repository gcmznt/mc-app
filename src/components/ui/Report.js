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

export default function Report({ icons, nextRound, result, round }) {
  return result ? (
    result
  ) : (
    <div className="report">
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
