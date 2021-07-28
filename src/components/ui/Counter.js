import { useState } from "react";
import "../../styles/counter.css";
import { ReactComponent as AccelerationImg } from "../../images/acceleration.svg";
import { ReactComponent as AdvanceImg } from "../../images/advance.svg";
import { ReactComponent as AmplifyImg } from "../../images/amplify.svg";
import { ReactComponent as CrisisImg } from "../../images/crisis.svg";
import { ReactComponent as HazardImg } from "../../images/hazard.svg";
import Status from "./Status";

const iconsImages = {
  Acceleration: <AccelerationImg />,
  Amplify: <AmplifyImg />,
  Hazard: <HazardImg />,
  Crisis: <CrisisImg />,
};

export default function Counter({
  acceleratedStep,
  advance,
  disabled,
  icons,
  last = true,
  lastLabel,
  limit,
  min,
  onAdd,
  onAddLimit,
  onEnable,
  onNext,
  onPrev,
  onStep,
  onReduce,
  onReduceLimit,
  onStatusToggle,
  status,
  stepLabel,
  title,
  value,
}) {
  const [editMode, setEditMode] = useState(false);

  const toggle = () => disabled || !limit || setEditMode((m) => !m);

  return (
    <div className="counter__wrapper">
      {status && <Status status={status} onToggle={onStatusToggle} />}

      {title && (
        <div className="counter__title">
          {title}{" "}
          {icons &&
            icons.map((icon) => (
              <span key={icon} className="counter__icon">
                {iconsImages[icon]}
              </span>
            ))}
        </div>
      )}

      <div className="counter">
        {!disabled && onPrev && (
          <div
            className={`counter__btn counter__prev ${
              editMode ? "is-disabled" : ""
            }`}
            onClick={onPrev}
          >
            «
          </div>
        )}

        {!disabled && (
          <div
            className={`counter__btn counter__reduce ${
              (!editMode && value <= min) || (editMode && value >= limit)
                ? "is-disabled"
                : ""
            }`}
            onClick={editMode ? onReduceLimit : onReduce}
          >
            &minus;
          </div>
        )}

        {limit === -1 ? (
          <div className="counter__value">
            <big>{value}</big>
          </div>
        ) : editMode ? (
          <div className="counter__value" onClick={toggle}>
            <small>{value}</small>
            <span className="fraction">/</span>
            <big>{limit}</big>
          </div>
        ) : (
          <div className="counter__value" onClick={toggle}>
            <big>{value}</big>
            <span className="fraction">/</span>
            <small>{limit}</small>
          </div>
        )}

        {!disabled && (
          <div
            className={`counter__btn counter__add ${
              !editMode && value >= limit && limit > min ? "is-disabled" : ""
            }`}
            onClick={editMode ? onAddLimit : onAdd}
          >
            +
          </div>
        )}

        {!disabled && onStep && (
          <div
            className={`counter__btn counter__step ${
              !editMode && value >= limit && limit > min ? "is-disabled" : ""
            }`}
            onClick={onStep}
          >
            {stepLabel || <AdvanceImg />}
            {acceleratedStep && (
              <span className="counter__badge">{acceleratedStep}</span>
            )}
          </div>
        )}
        {!disabled && onNext && (
          <div
            className={`counter__btn counter__next ${
              !editMode &&
              ((limit > 0 && value >= limit) ||
                (limit === 0 && value === limit) ||
                value === advance ||
                limit === -1)
                ? ""
                : "is-disabled"
            }`}
            onClick={onNext}
          >
            {last ? lastLabel || "✓" : "»"}
          </div>
        )}
        {disabled && onEnable && (
          <div className={`counter__btn counter__next`} onClick={onEnable}>
            +
          </div>
        )}
      </div>
    </div>
  );
}
