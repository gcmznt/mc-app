import { useState } from "react";
import modularSet from "../data/modular-sets.json";
import schemes from "../data/schemes.json";
import { getRandom } from "../utils";
import Mode from "./Mode";
import Players from "./Players";

const aspects = ["Aggression", "Justice", "Leadership", "Protection"];

export default function Generate({ onGenerate, selection }) {
  const [mode, setMode] = useState("Standard");
  const [players, setPlayers] = useState(1);
  const [aspect, setAspect] = useState(true);
  const [modular, setModular] = useState(true);

  const getAspects = (h) =>
    !aspect ? h : { ...h, aspects: getRandom(aspects, h.aspects.length) };

  const randomize = () => {
    const heroes = getRandom(selection.heroes, players).map(getAspects);
    const scenario = getRandom(selection.scenarios)[0];
    onGenerate({
      heroes,
      mode,
      players,
      randomAspects: aspect,
      randomModular: modular,
      scenario: {
        ...scenario,
        mainScheme: scenario.mainScheme.map((s) => schemes[s]),
        modular: !modular
          ? scenario.modular.map((m) => modularSet[m])
          : getRandom(Object.values(modularSet), scenario.modular.length),
      },
    });
  };

  return (
    <div>
      <div className="box">
        <div className="box__title">Players</div>
        <div className="box__content">
          <Players
            onChange={setPlayers}
            value={players}
            max={selection.heroes.length}
          />
        </div>
      </div>
      <div className="box">
        <div className="box__title">Mode</div>
        <div className="box__content">
          <Mode onChange={setMode} value={mode} />
        </div>
      </div>
      <div className="box">
        <div className="box__title">Random</div>
        <div className="box__content">
          <div>
            <label>
              <input
                type="checkbox"
                checked={aspect}
                onChange={(e) => setAspect(e.target.checked)}
              />{" "}
              Get random aspect
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={modular}
                onChange={(e) => setModular(e.target.checked)}
              />{" "}
              Get random modular set
            </label>
          </div>
        </div>
      </div>
      <button onClick={randomize}>Generate</button>
    </div>
  );
}
