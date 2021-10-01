import { useMemo } from "react";
import { useData } from "../context/data";
import { RESULT_TYPES } from "../utils/constants";
import Box from "./ui/Box";
import Match from "./ui/Match";
import "../styles/statistics.css";
import { resultText } from "../utils/texts";

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

function getLongest(longest, match) {
  return (getMatchTime(match) || 0) > getMatchTime(longest) ? match : longest;
}

function getStats(matches = []) {
  return matches.reduce(
    (stats, match) => ({
      ...stats,
      aspects: getAspects(stats.aspects, match),
      heroes: getHeroes(stats.heroes, match),
      scenario: getScenario(stats.scenario, match),
      longest: getLongest(stats.longest, match),
      results: getMatchesStats(stats.results, match),
    }),
    {
      results: EMPTY_RESULTS,
      aspects: {},
      heroes: {},
      scenario: {},
      longest: false,
      played: matches.length,
    }
  );
}

function Row({ label, values }) {
  return (
    <tr>
      <th className="u-ellipsis">{label}</th>
      <td>{Object.values(values).reduce((a, b) => a + b)}</td>
      <td>{getPerc(values)}</td>
      <td>{getWins(values)}</td>
      <td>{getLost(values)}</td>
    </tr>
  );
}

export default function Statistics({ onLoad }) {
  const { deleteMatch, matches } = useData();

  const stats = useMemo(
    () => getStats(matches.filter((m) => !m.trash)),
    [matches]
  );

  const handleDelete = (match) => {
    const msg = match
      ? `Delete ${match.heroes.join(" + ")} VS ${match.scenario}?`
      : "Delete all matches?";

    if (window.confirm(msg)) deleteMatch(match);
  };

  const handleReplay = (match) => {
    onLoad(matches.find((m) => m.matchId === match.matchId).setup);
  };

  console.log(stats, matches.sort(byDate)[0]);

  return (
    <div className="statistics">
      <Box key="Results" title="Results" flag flat>
        <table className="statistics__table">
          <tbody>
            <tr>
              <th>Total</th>
              <td>{stats.played}</td>
            </tr>
            {Object.entries(stats.results).map(([k, v]) => (
              <tr key={k}>
                <th>{resultText(k)}</th>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      {!!matches.length && (
        <>
          <Box key="Heroes" title="Heroes" flag flat>
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
                {Object.entries(stats.heroes)
                  .sort(byName)
                  .map(([k, v]) => (
                    <Row key={k} label={k} values={v} />
                  ))}
              </tbody>
            </table>
          </Box>
          <Box key="Scenarios" title="Scenarios" flag flat>
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
                {Object.entries(stats.scenario)
                  .sort(byName)
                  .map(([k, v]) => (
                    <Row key={k} label={k} values={v} />
                  ))}
              </tbody>
            </table>
          </Box>
          <Box key="Longest Match" title="Longest Match" flag flat type="log">
            <Match
              match={stats.longest}
              onDelete={handleDelete}
              onReplay={handleReplay}
            />
          </Box>
          <Box key="Matches" title="Matches" flag flat type="log">
            {matches.sort(byDate).map((match) => (
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
    </div>
  );
}
