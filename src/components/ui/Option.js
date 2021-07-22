import "../../styles/option.css";

export default function Option({ checked, flag, label, onChange, value }) {
  return (
    <label className="option">
      <span>
        <input
          checked={checked}
          onChange={onChange}
          type="checkbox"
          value={value}
        />{" "}
        {label}
      </span>
      {flag && <span className="option__flag">{flag}</span>}
    </label>
  );
}
