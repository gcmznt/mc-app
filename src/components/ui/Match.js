import { Fragment } from "react";
import { useTranslation } from "react-i18next";

import "../../styles/match.css";
import { msToTime } from "../../utils";
import { resultText } from "../../utils/texts";
import Dot from "./Dot";

export default function Match({ match, onDelete, onReplay }) {
  const { t } = useTranslation();

  return (
    <div className="match" data-id={match.matchId}>
      <div>
        <div>
          {(match.setup.heroesAndAspects || match.setup.heroes).map((h) => (
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
          {t(match.setup.scenarioName || match.setup.scenario.name)}{" "}
          <small className="match__mode">[{match.setup.mode}]</small>
        </div>
        <div>
          {t(resultText(match.reason))}
          {match.complete ? ` in ${msToTime(match.time)}` : ""}
        </div>
      </div>
      <div className="match__info">
        <small className="match__date">
          {new Date(match.date).toLocaleDateString()}
        </small>
        <small className="match__date">
          {new Date(match.date).toLocaleTimeString().slice(0, -3)}
        </small>
        <span className="match__delete" onClick={() => onDelete(match)}>
          {t("Delete")}
        </span>{" "}
        |{" "}
        <span className="match__delete" onClick={() => onReplay(match)}>
          {t("Replay")}
        </span>
      </div>
    </div>
  );
}
