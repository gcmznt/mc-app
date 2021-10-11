import "../../styles/actions.css";
import { getClassName } from "../../utils";

export function Action({ active, disabled, icon, label, onClick }) {
  const classList = [
    "actions__button",
    active && "is-active",
    disabled && "is-disabled",
  ];

  return (
    <div
      className={getClassName(classList)}
      onClick={!disabled ? onClick : undefined}
    >
      {icon}
      {icon ? <small>{label}</small> : label}
    </div>
  );
}

export default function Actions({ children }) {
  return <div className="actions">{children}</div>;
}
