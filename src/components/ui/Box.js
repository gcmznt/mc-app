import highlightImg from "../../images/first.svg";
import "../../styles/box.css";

export default function Box({ children, flag, flat, highlight, title, type }) {
  const classList = [
    "box",
    flag && "box--flag",
    flat && "box--flat",
    type && `is-${type}`,
  ];
  return (
    <div className={classList.filter((c) => c).join(" ")}>
      {title && (
        <div className="box__title">
          <div className="box__title-text">{title}</div>
          {highlight && (
            <img className="box__highlight" src={highlightImg} alt="" />
          )}
        </div>
      )}
      <div className="box__content">{children}</div>
    </div>
  );
}
