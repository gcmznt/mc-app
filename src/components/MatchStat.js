import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { useData } from "../context/data";
import { useFirebase } from "../context/firebase";
import { msToTime } from "../utils";
import { COUNTER_TYPES, PAGES } from "../utils/constants";
import {
  getHeroesAndAspects,
  getMatchStats,
  getScenarioName,
} from "../utils/statistics";
import { getChain, getPrev, isActive } from "../utils/status";
import { resultText } from "../utils/texts";
import Box, { BoxBand } from "./ui/Box";
import Setup from "./ui/Setup";

const byType = (a, b) =>
  a.type === b.type
    ? a.name.localeCompare(b.name)
    : a.type.localeCompare(b.type);

function Row({ label, next, prev, sublabel, value, ...props }) {
  return (
    <tr {...props}>
      <th className={`${next ? "has-next" : ""} ${prev ? "has-prev" : ""}`}>
        {label} {sublabel && <small>[{sublabel}]</small>}
      </th>
      <td className="statistics__value">{value}</td>
    </tr>
  );
}

function RowCounter({ counter, match, inverse, endLabel = "✅" }) {
  const { t } = useTranslation();

  const val = inverse ? counter.max - counter.value : counter.value;

  return (
    <Row
      label={t(counter.name)}
      sublabel={
        match.log.flips?.[counter.id] &&
        `${t("Flips")}: ${match.log.flips?.[counter.id] || 0}`
      }
      next={!!counter.next}
      prev={getPrev(counter, match.finalStatus)}
      value={`${
        !counter.active && counter.value >= counter.max ? `${endLabel} ` : ""
      }${
        counter.max > 0
          ? `${val}/${counter.max}`
          : counter.start > 0
          ? `${val}/${counter.start}`
          : counter.value
      }`}
      style={{
        "--val":
          counter.max > 0
            ? val / counter.max
            : counter.start > 0
            ? val / counter.start
            : val
            ? 1
            : 0,
      }}
      className={`has-progress is-${counter.type}`}
    />
  );
}

export default function MatchStat({ matchId, onLoad }) {
  const { loadMatch } = useFirebase();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { deleteMatch, stats } = useData();
  const [match, setMatch] = useState(false);

  const handleDelete = (match) => {
    const msg = `Delete ${getHeroesAndAspects(match.setup)
      .map((h) => h.name)
      .join(" + ")} VS ${getScenarioName(match)}?`;

    if (window.confirm(msg))
      deleteMatch(match).then(() => setLocation(PAGES.STATISTICS));
  };

  useEffect(() => {
    loadMatch(matchId).then((m) => {
      setMatch(m ? getMatchStats(m) : stats.find((m) => m.matchId === matchId));
    });
  }, [loadMatch, matchId, stats]);

  return match ? (
    <Fragment>
      <Box key="Setup">
        <Setup setup={match.setup} />
      </Box>
      <Box type={match.reason}>
        <BoxBand>
          {t(resultText(match.reason))
            .split(" | ")
            .map((text, i) =>
              i === 0 ? (
                <div key={text}>{text}</div>
              ) : (
                <div key={text}>
                  <small>{text}</small>
                </div>
              )
            )}
        </BoxBand>
        {match.date.toLocaleString()}
      </Box>

      {match.complete && (
        <Box flag>
          <table className="statistics__table">
            <tbody>
              {match.complete && (
                <Row label={t("Length")} value={msToTime(match.time)} />
              )}
              <Row label={t("Rounds")} value={match.log.rounds} />
              <Row
                label={t("Acceleration")}
                value={
                  match.finalStatus.find((c) => c.name === "Acceleration").value
                }
              />
              <Row
                label={t("Allies")}
                sublabel={t("Defeated/Entered")}
                value={`${match.log.allDef}/${match.log.allies}`}
                className="is-ally"
              />
              <Row
                label={t("Minions")}
                sublabel={t("Defeated/Entered")}
                value={`${match.log.minDef}/${match.log.minions}`}
                className="is-minion"
              />
              <Row
                label={t("Side schemes")}
                sublabel={t("Cleared/Entered")}
                value={`${match.log.sideCl}/${match.log.schemes}`}
                className="is-scheme"
              />
            </tbody>
          </table>
        </Box>
      )}

      {match.complete && (
        <Box title="Final status">
          <table className="statistics__table">
            <tbody>
              {match.finalStatus
                .filter((c) => c.type === COUNTER_TYPES.HERO)
                .map((c) => (
                  <RowCounter
                    key={c.id}
                    counter={c}
                    match={match}
                    endLabel="💀"
                    inverse
                  />
                ))}
              {match.finalStatus
                .filter((c) => c.type === COUNTER_TYPES.VILLAIN && !c.next)
                .map((c) => getChain(c, match.finalStatus))
                .flat()
                .map((c) => (
                  <RowCounter
                    key={c.id}
                    counter={c}
                    match={match}
                    endLabel="💀"
                    inverse
                  />
                ))}
              {match.finalStatus
                .filter((c) => c.type === COUNTER_TYPES.SCENARIO && !c.next)
                .map((c) => getChain(c, match.finalStatus))
                .flat()
                .map((c) => (
                  <RowCounter key={c.id} counter={c} match={match} />
                ))}
              {match?.finalStatus
                .filter(isActive)
                .filter((c) =>
                  [
                    COUNTER_TYPES.ALLY,
                    COUNTER_TYPES.MINION,
                    COUNTER_TYPES.SIDE_SCHEME,
                  ].includes(c.type)
                )
                .sort(byType)
                .map((c) => (
                  <RowCounter key={c.id} counter={c} match={match} />
                ))}
            </tbody>
          </table>
        </Box>
      )}
      <button onClick={() => onLoad(match.setup)}>{t("Replay")}</button>
      <button onClick={() => handleDelete(match)}>{t("Delete")}</button>
    </Fragment>
  ) : null;
}
