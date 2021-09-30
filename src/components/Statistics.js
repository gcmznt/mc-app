import { useMemo } from "react";
import { useData } from "../context/data";
import { RESULT_TYPES } from "../utils/constants";
import Box from "./ui/Box";
import Match from "./ui/Match";

const ellipsis = {
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const tableStyle = {
  width: "100%",
  textAlign: "right",
  whiteSpace: "nowrap",
};

const emptyResults = Object.values(RESULT_TYPES).reduce(
  (acc, cur) => ({ ...acc, [cur]: 0 }),
  {}
);

const result_text = {
  defeated: "Lost by heroes defeat",
  "give-up": "Gave up",
  "scheme-win": "Win by scheme",
  scheme: "Lost by scheme",
  winner: "Villain defeated",
};

const getWins = (values) =>
  values[RESULT_TYPES.SCHEME_WIN] + values[RESULT_TYPES.WINNER];

const getLost = (values) =>
  values[RESULT_TYPES.DEFEATED] +
  values[RESULT_TYPES.SCHEME] +
  values[RESULT_TYPES.GIVE_UP];

const getPerc = (values) => {
  const w = getWins(values);
  const l = getLost(values);

  return w + l ? ((w / (w + l)) * 100).toFixed(1) : "-";
};

const getMatchesStats = (data) =>
  (data || []).reduce(
    (acc, match) => ({
      ...acc,
      [match.reason]: (acc[match.reason] || 0) + 1,
    }),
    { ...emptyResults }
  );

const reducer = (acc, match) => ({
  ...acc,
  [match.entry]: {
    ...(acc[match.entry] || emptyResults),
    [match.result]: (acc[match.entry]?.[match.result] || 0) + 1,
  },
});

const getHeroesStats = (data) =>
  (data || [])
    .map((match) =>
      (match.setup.heroesAndAspects || match.setup.heroes).map((h) => ({
        entry: h.name,
        result: match.reason,
      }))
    )
    .flat()
    .reduce(reducer, {});

const getScenariosStats = (data) =>
  (data || [])
    .map((match) => ({
      entry: match.setup.scenarioName || match.setup.scenario.name,
      result: match.reason,
    }))
    .reduce(reducer, {});

const getMatches = (data) =>
  data.map((match) => ({
    date: new Date(match.date),
    heroes: (match.setup.heroesAndAspects || match.setup.heroes).map(
      (h) => h.name
    ),
    matchId: match.matchId,
    mode: match.setup.mode,
    result: result_text[match.reason],
    scenario: match.setup.scenarioName || match.setup.scenario.name,
  }));

function Row({ label, values }) {
  return (
    <tr>
      <td style={ellipsis}>{label}</td>
      <td>{Object.values(values).reduce((a, b) => a + b)}</td>
      <td>{getPerc(values)}</td>
      <td>{getWins(values)}</td>
      <td>{getLost(values)}</td>
    </tr>
  );
}

const byName = (a, b) => a[0].localeCompare(b[0]);
const byDate = (a, b) => b.date - a.date;

export default function Statistics({ onLoad }) {
  const { deleteMatch, matches: stats } = useData();

  const matches = useMemo(() => stats.filter((m) => !m.trash), [stats]);

  const handleDelete = (match) => {
    const msg = match
      ? `Delete ${match.heroes.join(" + ")} VS ${match.scenario}?`
      : "Delete all matches?";

    if (window.confirm(msg)) deleteMatch(match);
  };

  const handleReplay = (match) => {
    onLoad(matches.find((m) => m.matchId === match.matchId).setup);
  };

  return (
    <div>
      <Box key="Results" title="Results" flag flat>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td>Total</td>
              <td>{matches.length}</td>
            </tr>
            {Object.entries(getMatchesStats(matches)).map(([k, v]) => (
              <tr key={k}>
                <td>{result_text[k]}</td>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      {!!matches.length && (
        <Box key="Heroes" title="Heroes" flag flat>
          <table style={tableStyle}>
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
              {Object.entries(getHeroesStats(matches))
                .sort(byName)
                .map(([k, v]) => (
                  <Row key={k} label={k} values={v} />
                ))}
            </tbody>
          </table>
        </Box>
      )}
      {!!matches.length && (
        <Box key="Scenarios" title="Scenarios" flag flat>
          <table style={tableStyle}>
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
              {Object.entries(getScenariosStats(matches))
                .sort(byName)
                .map(([k, v]) => (
                  <Row key={k} label={k} values={v} />
                ))}
            </tbody>
          </table>
        </Box>
      )}
      {!!matches.length && (
        <Box key="Matches" title="Matches" flag flat type="log">
          {getMatches(matches)
            .sort(byDate)
            .map((match) => (
              <Match
                key={match.matchId}
                match={match}
                onDelete={handleDelete}
                onReplay={handleReplay}
              />
            ))}
        </Box>
      )}
      {!!matches.length && (
        <button onClick={() => handleDelete()}>Delete all</button>
      )}
    </div>
  );
}
