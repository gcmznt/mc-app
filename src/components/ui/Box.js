import { useTranslation } from "react-i18next";

import highlightImg from "../../images/first.svg";
import "../../styles/box.css";
import { getClassName } from "../../utils";

export function BoxBand({ children }) {
  return <div className="box__band">{children}</div>;
}

export default function Box({
  children,
  highlight,
  icon,
  subtitle,
  title,
  type,
}) {
  const { t } = useTranslation();

  const classList = ["box", type && `is-${type}`];

  return (
    <div className={getClassName(classList)}>
      {icon && <div className="box__icon">{icon}</div>}
      {title && (
        <div className="box__title">
          <div className="box__title-text">{t(title)}</div>
          {highlight && (
            <img className="box__highlight" src={highlightImg} alt="" />
          )}
          {subtitle && <div className="box__subtitle">{t(subtitle)}</div>}
        </div>
      )}
      <div className="box__content">{children}</div>
    </div>
  );
}
