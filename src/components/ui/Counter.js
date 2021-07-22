import { useState } from "react";
import "../../styles/counter.css";

export default function Counter({
  advance,
  disabled,
  last = true,
  lastLabel,
  limit,
  onAdd,
  onAddLimit,
  onEnable,
  onNext,
  onPrev,
  onReduce,
  onReduceLimit,
  over,
  title,
  value,
}) {
  const [editMode, setEditMode] = useState(false);

  const toggle = () => disabled || over || setEditMode((m) => !m);

  return (
    <div>
      {title && <div>{title}</div>}

      <div className="counter">
        {!disabled && onPrev && (
          <div
            className={`counter__prev ${
              editMode || value > 0 ? "is-disabled" : ""
            }`}
            onClick={onPrev}
          >
            «
          </div>
        )}

        {!disabled && (
          <div
            className={`counter__reduce ${
              (!editMode && value <= 0) || (editMode && value >= limit)
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
            className={`counter__add ${
              !editMode && value >= limit && limit > 0 ? "is-disabled" : ""
            }`}
            onClick={editMode ? onAddLimit : onAdd}
          >
            +
          </div>
        )}

        {!disabled && onNext && (
          <div
            className={`counter__next ${
              editMode || (over ? value !== limit : value < limit)
                ? "is-disabled"
                : ""
            }`}
            onClick={onNext}
          >
            {last ? lastLabel || "✓" : "»"}
          </div>
        )}
        {disabled && onEnable && (
          <div className={`counter__next`} onClick={onEnable}>
            +
          </div>
        )}
      </div>
    </div>
  );
}
