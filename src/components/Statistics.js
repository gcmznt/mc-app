import { useCallback, useMemo, useState } from "react";
import { useData } from "../context/data";
import { FILTERS, RESULT_TYPES } from "../utils/constants";
import Box from "./ui/Box";
import Match from "./ui/Match";
import "../styles/statistics.css";
import { resultText } from "../utils/texts";
import Dot from "./ui/Dot";
import Filters from "./ui/Filters";

const EMPTY_RESULTS = Object.fromEntries(
  Object.values(RESULT_TYPES).map((v) => [v, 0])
);

const byName = (a, b) => a[0].localeCompare(b[0]);
const byDate = (a, b) => new Date(b.date) - new Date(a.date);

function getWins(values) {
  return values[RESULT_TYPES.SCHEME_WIN] + values[RESULT_TYPES.WINNER];
}

function getLost(values) {
  return (
    values[RESULT_TYPES.DEFEATED] +
    values[RESULT_TYPES.SCHEME] +
    values[RESULT_TYPES.GIVE_UP]
  );
}

function getPerc(values) {
  const w = getWins(values);
  const l = getLost(values);

  return w + l ? ((w / (w + l)) * 100).toFixed(1) : "-";
}

export function getMatchTime(match) {
  return match ? match.time || match.log[0].time : 0;
}

export function getMatchLength(match) {
  return match
    ? new Date(match.log[0].date) -
        new Date(match.log[match.log.length - 1].date)
    : 0;
}

function getScenarioName(match) {
  return match.setup.scenarioName || match.setup.scenario.name;
}

function getHeroesAndAspects(match) {
  return match.setup.heroesAndAspects || match.setup.heroes;
}

function getMatchesStats(res, match) {
  return {
    ...res,
    [match.reason]: (res[match.reason] || 0) + 1,
  };
}

const addToObj = (obj, [k, v]) => ({
  ...obj,
  [k]: { ...(obj[k] || EMPTY_RESULTS), [v]: (obj[k]?.[v] || 0) + 1 },
});

function getAspects(aspects, match) {
  return getHeroesAndAspects(match)
    .map((h) => h.aspects.map((a) => [a, match.reason]))
    .flat()
    .reduce(addToObj, aspects);
}

function getHeroes(heroes, match) {
  return getHeroesAndAspects(match)
    .map((h) => [h.name, match.reason])
    .reduce(addToObj, heroes);
}

function getScenario(scenario, match) {
  return addToObj(scenario, [getScenarioName(match), match.reason]);
}

function getPlayersStats(players, match) {
  return addToObj(players, [getHeroesAndAspects(match).length, match.reason]);
}

function getFastest(fastest, match) {
  return match.complete &&
    (!fastest || getMatchTime(match) < getMatchTime(fastest))
    ? match
    : fastest;
}

function getLongest(longest, match) {
  return (getMatchTime(match) || 0) > getMatchTime(longest) ? match : longest;
}

function getStats(matches = []) {
  return matches.reduce(
    (stats, match) => ({
      ...stats,
      aspects: getAspects(stats.aspects, match),
      fastest: getFastest(stats.fastest, match),
      heroes: getHeroes(stats.heroes, match),
      longest: getLongest(stats.longest, match),
      players: getPlayersStats(stats.players, match),
      results: getMatchesStats(stats.results, match),
      scenario: getScenario(stats.scenario, match),
    }),
    {
      aspects: {},
      fastest: false,
      heroes: {},
      longest: false,
      played: matches.length,
      players: {},
      results: EMPTY_RESULTS,
      scenario: {},
    }
  );
}

const isVisible = (match) => (filter) => {
  switch (filter[0]) {
    case FILTERS.RESULT:
      return match.reason === filter[1];
    case FILTERS.PLAYERS:
      return getHeroesAndAspects(match).length === +filter[1];
    case FILTERS.HERO:
      return getHeroesAndAspects(match)
        .map((h) => h.name)
        .includes(filter[1]);
    case FILTERS.ASPECT:
      return getHeroesAndAspects(match)
        .map((h) => h.aspects)
        .flat()
        .includes(filter[1]);
    case FILTERS.SCENARIO:
      return getScenarioName(match).includes(filter[1]);
    default:
      return true;
  }
};

function Row({ filter, label, type, values, onClick }) {
  return (
    <tr>
      <th
        className={`u-ellipsis ${filter ? "is-filter" : ""}`}
        onClick={onClick}
      >
        {type === "aspects" && <Dot type={label.toLowerCase()} small />}
        {label}
        {type === "players" && ` player${label === "1" ? "" : "s"}`}
      </th>
      <td>{Object.values(values).reduce((a, b) => a + b)}</td>
      <td>{getPerc(values)}</td>
      <td>{getWins(values)}</td>
      <td>{getLost(values)}</td>
    </tr>
  );
}

export default function Statistics({ onLoad }) {
  const { deleteMatch, matches } = useData();
  const [filters, setFilters] = useState([]);

  const handleDelete = (match) => {
    const msg = match
      ? `Delete ${getHeroesAndAspects(match)
          .map((h) => h.name)
          .join(" + ")} VS ${getScenarioName(match)}?`
      : "Delete all matches?";

    if (window.confirm(msg)) deleteMatch(match);
  };

  const handleReplay = (match) => onLoad(match.setup);

  const matchFilters = useCallback(
    (match) => filters.length === 0 || filters.every(isVisible(match)),
    [filters]
  );

  const matchesLog = useMemo(
    () => matches.filter((m) => !m.trash).filter(matchFilters),
    [matchFilters, matches]
  );

  const stats = useMemo(() => getStats(matchesLog), [matchesLog]);

  const toggleFilter = ([k, v]) => {
    setFilters((fs) => {
      return fs.some((f) => f[0] === k && f[1] === v)
        ? fs.filter((f) => f[0] !== k || f[1] !== v)
        : [...fs, [k, v]];
    });
  };

  return (
    <div className="statistics">
      <Box key="Results" title="Results" flag flat>
        <table className="statistics__table">
          <tbody>
            <tr>
              <th>Total</th>
              <td>{stats.played}</td>
              <td></td>
            </tr>
            <tr>
              <th>-</th>
              <td></td>
              <td></td>
            </tr>
            {Object.entries(stats.results).map(([k, v]) => (
              <tr key={k}>
                <th
                  onClick={() => toggleFilter([FILTERS.RESULT, k])}
                  className={
                    filters.some((f) => f[0] === FILTERS.RESULT && f[1] === k)
                      ? "is-filter"
                      : ""
                  }
                >
                  {resultText(k)}
                </th>
                <td>{v}</td>
                <td
                  className={`statistics__bar is-${k}`}
                  style={{
                    "--val":
                      v / Math.max(...Object.values(stats.results)) || 0.005,
                  }}
                ></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      {[
        { title: "Players", filter: FILTERS.PLAYERS, key: "players" },
        { title: "Heroes", filter: FILTERS.HERO, key: "heroes" },
        { title: "Scenarios", filter: FILTERS.SCENARIO, key: "scenario" },
        { title: "Aspects", filter: FILTERS.ASPECT, key: "aspects" },
      ].map((el) => (
        <Box key={el.key} title={el.title} flag flat>
          <table className="statistics__table">
            <thead>
              <tr>
                <td></td>
                <td>P</td>
                <td>Win %</td>
                <td>W</td>
                <td>L</td>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats[el.key])
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
      {!!matchesLog.length && (
        <>
          {stats.longest && (
            <Box key="Longest Match" title="Longest Match" flag flat type="log">
              <Match
                match={stats.longest}
                onDelete={handleDelete}
                onReplay={handleReplay}
              />
            </Box>
          )}
          {stats.fastest && (
            <Box key="Fastest Match" title="Fastest Match" flag flat type="log">
              <Match
                match={stats.fastest}
                onDelete={handleDelete}
                onReplay={handleReplay}
              />
            </Box>
          )}
          <Box key="Matches" title="Matches" flag flat type="log">
            {matchesLog.sort(byDate).map((match) => (
              <Match
                key={match.matchId}
                match={match}
                onDelete={handleDelete}
                onReplay={handleReplay}
              />
            ))}
          </Box>
          <button onClick={() => handleDelete()}>Delete all</button>
        </>
      )}
      <Filters filters={filters} onToggle={toggleFilter} />
    </div>
  );
}
