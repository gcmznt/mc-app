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

export default function Report({ icons, result, round }) {
  return result ? (
    result
  ) : (
    <div className="report">
      <div>Round {round}</div>
      <div className="report__icons">
        {(icons || []).map((icon, i) => (
          <span key={i}>{iconsImages[icon]}</span>
        ))}
      </div>
    </div>
  );
}
