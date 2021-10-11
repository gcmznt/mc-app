import "../../styles/option.css";
import { getClassName } from "../../utils";

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
  const classList = ["option", variant && `option--${variant}`];

  return (
    <label className={getClassName(classList)}>
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
