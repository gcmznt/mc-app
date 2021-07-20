import "../styles/value.css";

export default function Value({
  disabled,
  mod,
  onAdd,
  onReduce,
  reverse,
  value,
}) {
  return (
    <div
      className={`value ${reverse ? "value--reverse" : ""} ${
        mod ? `value--${mod}` : ""
      }`}
    >
      <div className="value__value" onClick={onAdd}>
        {value}
      </div>
      {!disabled && (
        <div className="value__add" onClick={onAdd}>
          +
        </div>
      )}
      {!disabled && (
        <div className="value__reduce" onClick={onReduce}>
          &minus;
        </div>
      )}
    </div>
  );
}
