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
import { resultText } from "../utils/texts";
import Box, { BoxBand } from "./ui/Box";
import Setup from "./ui/Setup";

function Row({ label, value, ...props }) {
  return (
    <tr {...props}>
      <th>{label}</th>
      <td className="statistics__value">{value}</td>
    </tr>
  );
}

export default function MatchStat({ matchId, onLoad }) {
  const { loadMatch } = useFirebase();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { deleteMatch } = useData();
  const [match, setMatch] = useState(false);

  const handleDelete = (match) => {
    const msg = `Delete ${getHeroesAndAspects(match)
      .map((h) => h.name)
      .join(" + ")} VS ${getScenarioName(match)}?`;

    if (window.confirm(msg))
      deleteMatch(match).then(() => setLocation(PAGES.STATISTICS));
  };

  const getLastActive = (counter) => {
    if (!counter) return false;
    if (counter.active) return counter;

    const prev = match.finalStatus.find((c) => c.next === counter.name);
    return getLastActive(prev) || (!counter.next && counter);
  };

  useEffect(() => {
    loadMatch(matchId).then((m) => m && setMatch(getMatchStats(m)));
  }, [loadMatch, matchId]);

  console.log(match);

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
              label={t("Allies [Defeated/Entered]")}
              value={`${match.log.allDef}/${match.log.allies}`}
              className="is-ally"
            />
            <Row
              label={t("Minions [Defeated/Entered]")}
              value={`${match.log.minDef}/${match.log.minions}`}
              className="is-minion"
            />
            <Row
              label={t("Side schemes [Cleared/Entered]")}
              value={`${match.log.sideCl}/${match.log.schemes}`}
              className="is-scheme"
            />
          </tbody>
        </table>
      </Box>
      <Box title="Final status">
        <table className="statistics__table">
          <tbody>
            {match.finalStatus
              .filter((c) => c.type === COUNTER_TYPES.HERO)
              .map((c) => (
                <Row
                  label={`${t(c.name)}${!c.active ? " 💀" : ""}`}
                  key={c.name}
                  value={`${c.max - c.value}/${c.max}`}
                  style={{ "--val": (c.max - c.value) / c.max }}
                  className="has-progress is-hero"
                />
              ))}
            {match.finalStatus
              .filter((c) => c.type === COUNTER_TYPES.VILLAIN && !c.next)
              .map(getLastActive)
              .map((c) => (
                <Row
                  label={t(c.name)}
                  key={c.name}
                  value={`${!c.active ? "💀 " : ""}${c.max - c.value}/${c.max}`}
                  style={{ "--val": (c.max - c.value) / c.max }}
                  className="has-progress is-villain"
                />
              ))}
            {match.finalStatus
              .filter((c) => c.type === COUNTER_TYPES.SCENARIO && !c.next)
              .map(getLastActive)
              .map((c) => (
                <Row
                  label={t(c.name)}
                  key={c.name}
                  value={`${!c.active ? "✓ " : ""}${c.value}/${c.max}`}
                  style={{ "--val": c.value / c.max }}
                  className="has-progress is-scenario"
                />
              ))}
          </tbody>
        </table>
      </Box>
      <button onClick={() => onLoad(match.setup)}>{t("Replay")}</button>
      <button onClick={() => handleDelete(match)}>{t("Delete")}</button>
    </Fragment>
  ) : null;
}

// [
//   {
//     name: "Rounds",
//     active: true,
//     type: "rounds",
//     next: false,
//     value: 1,
//     max: 0,
//   },
//   {
//     name: "Phases",
//     active: true,
//     type: "phases",
//     next: false,
//     value: 1,
//     max: 0,
//   },
//   {
//     name: "Bruce Banner",
//     active: false,
//     type: "hero",
//     next: false,
//     value: 18,
//     max: 18,
//   },
//   {
//     name: "Steve Rogers",
//     active: false,
//     type: "hero",
//     next: false,
//     value: 11,
//     max: 11,
//   },
//   {
//     name: "Loki I",
//     active: true,
//     type: "villain",
//     next: false,
//     value: 0,
//     max: 40,
//   },
//   {
//     name: "All Hail King Loki",
//     active: true,
//     type: "scenario",
//     next: false,
//     value: 2,
//     max: 24,
//   },
//   {
//     name: "Acceleration",
//     active: true,
//     type: "acceleration",
//     next: false,
//     value: 0,
//     max: -1,
//   },
//   {
//     name: "Total Destruction",
//     active: false,
//     type: "side-scheme",
//     next: false,
//     value: 4,
//     max: 0,
//   },
//   {
//     name: "Hit Squad",
//     active: false,
//     type: "side-scheme",
//     next: false,
//     value: 6,
//     max: 0,
//   },
//   {
//     name: "Open the Bifrost",
//     active: false,
//     type: "side-scheme",
//     next: false,
//     value: 5,
//     max: 0,
//   },
//   {
//     name: "Madness on Midgard",
//     active: false,
//     type: "side-scheme",
//     next: false,
//     value: 7,
//     max: 0,
//   },
//   {
//     name: "War in Asgard",
//     active: true,
//     type: "side-scheme",
//     next: false,
//     value: 8,
//     max: 0,
//   },
//   {
//     name: "Casket of Ancient Winters",
//     active: false,
//     type: "side-scheme",
//     next: false,
//     value: 6,
//     max: 0,
//   },
//   {
//     name: "A Mess of Things",
//     active: false,
//     type: "side-scheme",
//     next: false,
//     value: 2,
//     max: 0,
//   },
//   {
//     name: "Hujahdarian Monarch Egg",
//     active: false,
//     type: "side-scheme",
//     next: false,
//     value: 7,
//     max: 0,
//   },
//   {
//     name: "Magical Teapot",
//     active: false,
//     type: "side-scheme",
//     next: false,
//     value: 7,
//     max: 0,
//   },
//   {
//     name: "Philosopher's Stone",
//     active: false,
//     type: "side-scheme",
//     next: false,
//     value: 7,
//     max: 0,
//   },
//   {
//     name: "Crystal Ball",
//     active: false,
//     type: "side-scheme",
//     next: false,
//     value: 7,
//     max: 0,
//   },
// ];
