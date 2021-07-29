import { useEffect, useState } from "react";
import { load, persist } from "../utils";
import { RESULT_TYPES, STORAGE_KEYS } from "../utils/constants";
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
  values[RESULT_TYPES.DEFEATED] + values[RESULT_TYPES.SCHEME];

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
      match.setup.heroes.map((h) => ({ entry: h.name, result: match.reason }))
    )
    .flat()
    .reduce(reducer, {});

const getScenariosStats = (data) =>
  (data || [])
    .map((match) => ({
      entry: match.setup.scenario.name,
      result: match.reason,
    }))
    .reduce(reducer, {});

const getMatches = (data) =>
  data.map((match) => ({
    date: new Date(match.date),
    heroes: match.setup.heroes.map((h) => h.name),
    id: match.matchId,
    result: result_text[match.reason],
    scenario: match.setup.scenario.name,
  }));

function Row({ label, values }) {
  return (
    <tr>
      <td style={ellipsis}>{label}</td>
      <td>{getWins(values)}</td>
      <td>{getLost(values)}</td>
      <td>{getPerc(values)}</td>
    </tr>
  );
}

const byName = (a, b) => a[0].localeCompare(b[0]);
const byDate = (a, b) => b.date - a.date;

export default function Statistics() {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(load(STORAGE_KEYS.MATCHES) || []);
  }, []);

  const handleDelete = (match) => {
    if (
      window.confirm(`Delete ${match.heroes.join(" + ")} VS ${match.scenario}?`)
    ) {
      const newData = data.filter((m) => m.matchId !== match.id);
      setData(newData);
      persist(STORAGE_KEYS.MATCHES, newData);
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm("Delete all matches?")) {
      setData([]);
      persist(STORAGE_KEYS.MATCHES, []);
    }
  };

  return (
    <div>
      <Box title="Matches" flag flat>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td>Total</td>
              <td>{data.length}</td>
            </tr>
            {Object.entries(getMatchesStats(data)).map(([k, v]) => (
              <tr key={k}>
                <td>{result_text[k]}</td>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      {!!data.length && (
        <Box title="Heroes" flag flat>
          <table style={tableStyle}>
            <thead>
              <tr>
                <td></td>
                <td>Winner</td>
                <td>Loser</td>
                <td>Win %</td>
              </tr>
            </thead>
            <tbody>
              {Object.entries(getHeroesStats(data))
                .sort(byName)
                .map(([k, v]) => (
                  <Row key={k} label={k} values={v} />
                ))}
            </tbody>
          </table>
        </Box>
      )}
      {!!data.length && (
        <Box title="Scenarios" flag flat>
          <table style={tableStyle}>
            <thead>
              <tr>
                <td></td>
                <td>Success</td>
                <td>Fails</td>
                <td>Success %</td>
              </tr>
            </thead>
            <tbody>
              {Object.entries(getScenariosStats(data))
                .sort(byName)
                .map(([k, v]) => (
                  <Row key={k} label={k} values={v} />
                ))}
            </tbody>
          </table>
        </Box>
      )}
      {!!data.length && <button onClick={handleDeleteAll}>Delete all</button>}
      {!!data.length && (
        <Box title="Matches" flag flat>
          {getMatches(data)
            .sort(byDate)
            .map((match) => (
              <Match key={match.id} match={match} onDelete={handleDelete} />
            ))}
        </Box>
      )}
    </div>
  );
}
