import React, { useState } from "react";
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

function Button({ action, counter, disabled, label, type }) {
  const classList = [
    "counter__btn",
    type && `counter__${type}`,
    disabled && "is-disabled",
  ]
    .filter((c) => c)
    .join(" ");

  return (
    <div className={classList} onClick={action}>
      {label}
      {counter && <span className="counter__badge">{counter}</span>}
    </div>
  );
}

function Value({ editMode, limit, toggle, value }) {
  return limit === -1 ? (
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
  );
}

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

  const canReduce = (!editMode && value > min) || (editMode && value < limit);
  const canAdd = editMode || limit <= 0 || (value < limit && limit > min);
  const canStep = onStep && !editMode && value < limit && limit > min;
  const canAdvance =
    onNext &&
    !editMode &&
    ((limit > 0 && value >= limit) ||
      (limit === 0 && value === 0) ||
      value === advance ||
      limit === -1) &&
    (typeof advance !== "boolean" || advance);

  // console.log(value, title, limit, min, advance);

  return (
    <div className="counter__wrapper">
      <div className="counter__title">
        {title && <span>{title}</span>}
        {status && <Status status={status} onToggle={onStatusToggle} />}
      </div>

      <span className="counter__icons">
        {(icons || []).map((icon, i) => (
          <React.Fragment key={i}>{iconsImages[icon]}</React.Fragment>
        ))}
      </span>

      <div className="counter">
        {!disabled && onPrev && (
          <Button action={onPrev} disabled={editMode} label="«" type="prev" />
        )}
        {!disabled && (
          <Button
            action={editMode ? onReduceLimit : onReduce}
            disabled={!canReduce}
            label="&minus;"
            type="reduce"
          />
        )}

        <Value
          editMode={editMode}
          limit={limit}
          toggle={toggle}
          value={value}
        />

        {!disabled && (
          <Button
            action={editMode ? onAddLimit : onAdd}
            disabled={!canAdd}
            label="+"
            type="add"
          />
        )}
        {!disabled && !canAdvance && canStep && (
          <Button
            action={onStep}
            counter={acceleratedStep}
            disabled={!canStep}
            label={stepLabel || <AdvanceImg />}
            type="next"
          />
        )}
        {!disabled && canAdvance && (
          <Button
            action={onNext}
            disabled={!canAdvance}
            label={last ? lastLabel || "✓" : "»"}
            type="next"
          />
        )}
        {disabled && onEnable && (
          <Button action={onEnable} label="+" type="next" />
        )}
      </div>
    </div>
  );
}
