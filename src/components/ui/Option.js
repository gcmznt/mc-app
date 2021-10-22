import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
        {typeof label === "string" ? t(label) : label}
      </span>
      {flag && <span className="option__flag">{t(flag)}</span>}
    </label>
  );
}
