import "../../styles/option.css";

export default function Option({
  checked,
  disabled = false,
  flag,
  label,
  onChange,
  type = "checkbox",
  value,
}) {
  return (
    <label className="option">
      <span>
        <input
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          type={type}
          value={value}
        />{" "}
        {label}
      </span>
      {flag && <span className="option__flag">{flag}</span>}
    </label>
  );
}
