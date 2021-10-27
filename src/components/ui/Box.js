import { useTranslation } from "react-i18next";

import highlightImg from "../../images/first.svg";
import "../../styles/box.css";
import { getClassName } from "../../utils";

export function BoxBand({ children }) {
  return <div className="box__band">{children}</div>;
}

export default function Box({ children, flag, flat, highlight, title, type }) {
  const { t } = useTranslation();

  const classList = [
    "box",
    flag && "box--flag",
    flat && "box--flat",
    type && `is-${type}`,
  ];

  return (
    <div className={getClassName(classList)}>
      {title && (
        <div className="box__title">
          <div className="box__title-text">{t(title)}</div>
          {highlight && (
            <img className="box__highlight" src={highlightImg} alt="" />
          )}
        </div>
      )}
      <div className="box__content">{children}</div>
    </div>
  );
}
