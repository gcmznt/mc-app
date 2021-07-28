import { useEffect, useState } from "react";
import { load } from "../utils";
import { RESULT_TYPES, STORAGE_KEYS } from "../utils/constants";
import Box from "./ui/Box";

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

export default function Statistics() {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(load(STORAGE_KEYS.MATCHES) || []);
  }, []);

  const results = data.reduce(
    (acc, match) => ({
      ...acc,
      [match.reason]: (acc[match.reason] || 0) + 1,
    }),
    { ...emptyResults }
  );

  const heroes = (data || [])
    .map((match) =>
      match.setup.heroes.map((h) => ({ hero: h.name, result: match.reason }))
    )
    .flat()
    .reduce(
      (acc, match) => ({
        ...acc,
        [match.hero]: {
          ...(acc[match.hero] || emptyResults),
          [match.result]: (acc[match.hero]?.[match.result] || 0) + 1,
        },
      }),
      {}
    );

  const scenarios = (data || [])
    .map((match) => ({
      scenario: match.setup.scenario.name,
      result: match.reason,
    }))
    .reduce(
      (acc, match) => ({
        ...acc,
        [match.scenario]: {
          ...(acc[match.scenario] || emptyResults),
          [match.result]: (acc[match.scenario]?.[match.result] || 0) + 1,
        },
      }),
      {}
    );

  return (
    <div>
      <Box title="Matches" flag flat>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td>Total</td>
              <td>{data.length}</td>
            </tr>
            {Object.entries(results).map(([k, v]) => (
              <tr key={k}>
                <td>{result_text[k]}</td>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
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
            {Object.entries(heroes).map(([k, v]) => (
              <tr key={k}>
                <td style={ellipsis}>{k}</td>
                <td>{getWins(v)}</td>
                <td>{getLost(v)}</td>
                <td>{getPerc(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
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
            {Object.entries(scenarios).map(([k, v]) => (
              <tr key={k}>
                <td style={ellipsis}>{k}</td>
                <td>{getWins(v)}</td>
                <td>{getLost(v)}</td>
                <td>{getPerc(v)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </div>
  );
}
