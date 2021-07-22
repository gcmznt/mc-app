import { useState } from "react";
import modularSet from "../data/modular-sets.json";
import schemes from "../data/schemes.json";
import { getRandom } from "../utils";
import Mode from "./Mode";
import Players from "./Players";
import Box from "./ui/Box";
import Option from "./ui/Option";

const aspects = ["Aggression", "Justice", "Leadership", "Protection"];

export default function Generate({ onGenerate, selection }) {
  const [mode, setMode] = useState("Standard");
  const [players, setPlayers] = useState(1);
  const [aspect, setAspect] = useState(true);
  const [modular, setModular] = useState(true);

  const getAspects = (h) =>
    !aspect ? h : { ...h, aspects: getRandom(aspects, h.aspects.length) };

  const getNemesisSchemes = (h) => ({
    ...h,
    nemesisSchemes: h.nemesisSchemes.map((s) => schemes[s]),
  });

  const getSideSchemes = (h) => ({
    ...h,
    sideSchemes: (h.sideSchemes || []).map((s) => schemes[s]),
  });

  const randomize = () => {
    const heroes = getRandom(selection.heroes, players)
      .map(getAspects)
      .map(getNemesisSchemes);
    const scenario = getRandom(selection.scenarios).map(getSideSchemes)[0];

    onGenerate({
      heroes,
      mode: (mode === "Random"
        ? getRandom(["Standard", "Expert"])[0]
        : mode
      ).toLowerCase(),
      players,
      randomAspects: aspect,
      randomModular: modular,
      scenario: {
        ...scenario,
        mainScheme: scenario.mainScheme.map((s) => schemes[s]),
        modular: [
          ...(scenario.encounter || [])
            .map((m) => modularSet[m])
            .map(getSideSchemes),
          ...(!modular
            ? scenario.modular.map((m) => modularSet[m])
            : getRandom(
                Object.values(modularSet).filter(
                  (m) => !(scenario.encounter || []).includes(m.name)
                ),
                scenario.modular.length
              )
          ).map(getSideSchemes),
        ],
      },
    });
  };

  return (
    <>
      <Box title="Players">
        <Players
          onChange={setPlayers}
          value={players}
          max={selection.heroes.length}
        />
      </Box>
      <Box title="Mode">
        <Mode onChange={setMode} value={mode} />
      </Box>
      <Box title="Random">
        <Option
          checked={aspect}
          label="Get random aspect"
          onChange={(e) => setAspect(e.target.checked)}
        />
        <Option
          checked={modular}
          label="Get random modular set"
          onChange={(e) => setModular(e.target.checked)}
        />
      </Box>
      <button onClick={randomize}>Generate</button>
    </>
  );
}
