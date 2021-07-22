import "../../styles/box.css";

export default function Box({ children, flag, flat, title, type }) {
  const classList = [
    "box",
    flag && "box--flag",
    flat && "box--flat",
    type && `is-${type}`,
  ];
  return (
    <div className={classList.filter((c) => c).join(" ")}>
      {title && <div className="box__title">{title}</div>}
      <div className="box__content">{children}</div>
    </div>
  );
}
