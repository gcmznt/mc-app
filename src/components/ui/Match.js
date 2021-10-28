import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

import "../../styles/match.css";
import { PAGES } from "../../utils/constants";
import { getHeroesAndAspects, getScenarioName } from "../../utils/statistics";
import { resultText } from "../../utils/texts";
import Dot from "./Dot";

export default function Match({ match }) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  return (
    <div
      className="match"
      data-id={match.matchId}
      onClick={() =>
        setLocation(PAGES.MATCH.replace(":matchId", match.matchId))
      }
    >
      <div>
        <div>
          {getHeroesAndAspects(match.setup).map((h) => (
            <Fragment key={h.name}>
              <span>{t(h.name)}</span>{" "}
              {h.aspects.map((a) => (
                <Dot key={a} type={a.toLowerCase()} small />
              ))}
            </Fragment>
          ))}
        </div>
        <div>
          <span className="match__vs">VS</span>{" "}
          {t(getScenarioName(match.setup))}{" "}
          <small className="match__mode">[{match.setup.mode}]</small>
        </div>
        <div>{t(resultText(match.reason))}</div>
      </div>
      <div className="match__info">
        <small className="match__date">
          {new Date(match.date).toLocaleDateString()}
        </small>
        <small className="match__date">
          {new Date(match.date).toLocaleTimeString().slice(0, -3)}
        </small>
      </div>
    </div>
  );
}
