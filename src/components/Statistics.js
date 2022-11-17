import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useData } from "../context/data";
import { FILTERS } from "../utils/constants";
import Box from "./ui/Box";
import Match from "./ui/Match";
import "../styles/statistics.css";
import { resultText } from "../utils/texts";
import Dot from "./ui/Dot";
import Filters from "./ui/Filters";
import Option from "./ui/Option";
import {
  byDate,
  getLost,
  getMatchStats,
  getPerc,
  getStats,
  getWins,
  isVisible,
} from "../utils/statistics";

function Row({ filter, label, type, values, onClick }) {
  const { t } = useTranslation();
  return (
    <tr>
      <th>
        <Option
          checked={filter}
          label={
            <>
              {type === "aspects" && <Dot type={label.toLowerCase()} small />}
              {type === "players"
                ? t("Players num", { numPlayers: label })
                : t(label)}
            </>
          }
          onChange={onClick}
        />
      </th>
      <td>{Object.values(values).reduce((a, b) => a + b)}</td>
      <td>{getPerc(values)}</td>
      <td>{getWins(values)}</td>
      <td>{getLost(values)}</td>
    </tr>
  );
}

export default function Statistics() {
  const { t } = useTranslation();
  const { deleteMatch, matches, stats } = useData();
  const [filters, setFilters] = useState([]);

  const byName = (a, b) => t(a[0]).localeCompare(t(b[0]));

  const handleDelete = () => {
    if (window.confirm(t("Delete all matches?"))) deleteMatch();
  };

  const matchFilters = useCallback(
    (match) => filters.length === 0 || filters.every(isVisible(match)),
    [filters]
  );

  const matchesLog = useMemo(
    () =>
      [...(stats || []), ...(matches || []).map(getMatchStats)]
        .filter((m) => !m.trash)
        .filter(matchFilters),
    [matchFilters, matches, stats]
  );

  const statistics = useMemo(() => getStats(matchesLog), [matchesLog]);

  const toggleFilter = ([k, v]) => {
    setFilters((fs) => {
      return fs.some((f) => f[0] === k && f[1] === v)
        ? fs.filter((f) => f[0] !== k || f[1] !== v)
        : [...fs, [k, v]];
    });
  };

  const isActive = (k) => (f) => f[0] === FILTERS.RESULT && f[1] === k;
  const statsMax = Math.max(...Object.values(statistics.results));

  return !stats || !matches ? null : (
    <div className="statistics">
      <Filters filters={filters} onToggle={toggleFilter} />

      <Box key="Results" title={t("Results")} flag flat>
        <table className="statistics__table">
          <tbody>
            <tr>
              <th>{t("Total")}</th>
              <td>{statistics.played}</td>
              <td></td>
            </tr>
            <tr>
              <th>-</th>
              <td></td>
              <td></td>
            </tr>
            {Object.entries(statistics.results).map(([k, v]) => (
              <tr key={k}>
                <th>
                  <Option
                    checked={filters.some(isActive(k))}
                    label={resultText(k)}
                    onChange={() => toggleFilter([FILTERS.RESULT, k])}
                  />
                </th>
                <td>{v}</td>
                <td
                  className={`statistics__bar is-${k}`}
                  style={{ "--val": v / statsMax || 0.005 }}
                ></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      {[
        { title: "Players", filter: FILTERS.PLAYERS, key: "players" },
        { title: "Modes", filter: FILTERS.MODES, key: "modes" },
        { title: "Heroes", filter: FILTERS.HERO, key: "heroes" },
        { title: "Scenarios", filter: FILTERS.SCENARIO, key: "scenario" },
        { title: "Modular sets", filter: FILTERS.MODULAR, key: "modular" },
        { title: "Aspects", filter: FILTERS.ASPECT, key: "aspects" },
      ].map((el) => (
        <Box key={el.key} title={t(el.title)} flag flat>
          <table className="statistics__table">
            <thead>
              <tr>
                <th></th>
                <td>{t("P")}</td>
                <td>{t("Win %")}</td>
                <td>{t("W")}</td>
                <td>{t("L")}</td>
              </tr>
            </thead>
            <tbody>
              {Object.entries(statistics[el.key])
                .sort(byName)
                .map(([k, v]) => (
                  <Row
                    key={k}
                    label={k}
                    values={v}
                    onClick={() => toggleFilter([el.filter, k])}
                    type={el.key}
                    filter={filters.some(
                      (f) => f[0] === el.filter && f[1] === k
                    )}
                  />
                ))}
            </tbody>
          </table>
        </Box>
      ))}

      {statistics.longest && (
        <Box title={t("Longest Match")} flag flat type="log">
          <Match match={statistics.longest} />
        </Box>
      )}

      {statistics.fastest && (
        <Box title={t("Fastest Match")} flag flat type="log">
          <Match match={statistics.fastest} />
        </Box>
      )}

      <Box key="Matches" title={t("Matches")} flag flat type="log">
        {(matchesLog || []).sort(byDate).map((match) => (
          <Match key={match.matchId} match={match} />
        ))}
      </Box>
      <button onClick={handleDelete}>{t("Delete all")}</button>
    </div>
  );
}
