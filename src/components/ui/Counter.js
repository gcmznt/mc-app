import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import "../../styles/counter.css";
import { ReactComponent as AccelerationImg } from "../../images/acceleration.svg";
import { ReactComponent as AdvanceImg } from "../../images/advance.svg";
import { ReactComponent as AmplifyImg } from "../../images/amplify.svg";
import { ReactComponent as CrisisImg } from "../../images/crisis.svg";
import { ReactComponent as HazardImg } from "../../images/hazard.svg";
import { ReactComponent as DangerImg } from "../../images/danger.svg";
import Status from "./Status";
import { MODIFIERS } from "../../utils/constants";

const iconsImages = {
  Acceleration: <AccelerationImg />,
  Amplify: <AmplifyImg />,
  Hazard: <HazardImg />,
  Crisis: <CrisisImg />,
};

function Button({ action, counter, danger, disabled, label, type, warning }) {
  const classList = [
    "counter__btn",
    type && `counter__${type}`,
    disabled && "is-disabled",
    danger && "is-danger",
    warning && `is-${warning}`,
  ]
    .filter((c) => c)
    .join(" ");

  return (
    <div className={classList} onClick={action}>
      {label}
      {counter && <span className="counter__badge">{counter}</span>}
      {warning && (
        <span className="counter__warning">
          <DangerImg />
        </span>
      )}
    </div>
  );
}

function Value({ complete, editMode, max, toggle, value }) {
  return max < 0 && complete < 0 ? (
    <div className="counter__value">
      <big>{value}</big>
    </div>
  ) : editMode ? (
    <div className="counter__value" onClick={toggle}>
      <small>{value}</small>
      <span className="fraction">/</span>
      <big>{max}</big>
    </div>
  ) : (
    <div className="counter__value" onClick={toggle}>
      <big>{value}</big>
      <span className="fraction">/</span>
      <small>{max}</small>
    </div>
  );
}

export default function Counter({
  acceleratedStep,
  counter,
  disabled,
  lastLabel,
  mods,
  onAdd,
  onAddLimit,
  onNext,
  onStep,
  onReduce,
  onReduceLimit,
  onStatusToggle,
  stepLabel,
  title,
  prevWarning,
  nextWarning,
}) {
  const { t } = useTranslation();
  const [editMode, setEditMode] = useState(false);
  const { advance, complete, max, min, value } = counter.values;

  const fullMax = mods
    .filter((m) => m.action === MODIFIERS.HIT_POINTS)
    .reduce((a, b) => a + b.data.value, max);

  const toggle = () =>
    disabled || !fullMax || counter.locked || setEditMode((m) => !m);

  const canReduce = (!editMode && value > min) || (editMode && value < fullMax);
  const canAdd = editMode || fullMax <= 0 || (value < fullMax && fullMax > min);
  const canStep = onStep && !editMode && value < fullMax && fullMax > min;

  const isComplete = fullMax <= min ? value <= fullMax : value >= fullMax;
  const minAdvance = advance === "min";
  const canAdvance =
    complete === -2 ||
    (complete !== -1 && ((minAdvance && value <= min) || isComplete));

  return (
    <div className="counter__wrapper">
      <div className="counter__title">
        {title && <span>{t(title)}</span>}
        {counter.statuses && (
          <Status status={counter.statuses} onToggle={onStatusToggle} />
        )}
      </div>

      <span className="counter__icons">
        {(counter.icons || []).map((icon, i) => (
          <React.Fragment key={i}>{iconsImages[icon]}</React.Fragment>
        ))}
      </span>

      <div className={`counter is-${counter.type}`}>
        <Value
          editMode={editMode}
          complete={complete}
          max={fullMax}
          toggle={toggle}
          value={value}
        />

        {!disabled && !counter.locked && (
          <>
            <Button
              action={editMode ? onReduceLimit : onReduce}
              disabled={!canReduce}
              label="&minus;"
              type="reduce"
              warning={prevWarning}
            />
            <Button
              action={editMode ? onAddLimit : onAdd}
              disabled={!canAdd}
              label="+"
              type="add"
              warning={nextWarning}
              danger={counter.statuses?.Tough}
            />

            {canAdvance ? (
              <Button
                action={onNext}
                label={counter.next ? "»" : lastLabel || "✓"}
                type="next"
              />
            ) : canStep ? (
              <Button
                action={onStep}
                counter={acceleratedStep}
                label={stepLabel || <AdvanceImg />}
                type="next"
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
