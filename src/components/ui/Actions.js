import "../../styles/actions.css";

export function Action({ active, disabled, icon, label, onClick }) {
  return (
    <div
      className={`actions__button ${active ? "is-active" : ""} ${
        disabled ? "is-disabled" : ""
      }`}
      onClick={!disabled ? onClick : undefined}
    >
      {icon}
      {icon ? <small>{label}</small> : label}
    </div>
  );
}

export default function Actions({ children, title, types }) {
  return (
    <div className={`actions ${(types || []).map((t) => `is-${t}`).join(" ")}`}>
      {title && <div className="actions__title">{title}</div>}
      <div className="actions__buttons">{children}</div>
    </div>
  );
}
