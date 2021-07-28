import "../../styles/actions.css";

export function Action({ label, onClick }) {
  return (
    <div className="actions__button" onClick={onClick}>
      {label}
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
