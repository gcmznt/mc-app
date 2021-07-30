import "../../styles/option.css";

export default function Option({
  checked,
  disabled = false,
  flag,
  label,
  onChange,
  type = "checkbox",
  value,
  variant = false,
}) {
  return (
    <label className={`option ${variant ? `option--${variant}` : ""}`}>
      <span>
        <input
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          type={type || "checkbox"}
          value={value}
          className={!type ? "is-hidden" : ""}
        />{" "}
        {label}
      </span>
      {flag && <span className="option__flag">{flag}</span>}
    </label>
  );
}
