import { useEffect, useState } from "react";
import modularSets from "../data/modular-sets.json";
import schemes from "../data/schemes.json";
import { getRandom, getRandomList } from "../utils";
import { ASPECTS, MODES, RANDOM, STORAGE_KEYS } from "../utils/constants";
import Mode from "./Mode";
import Players from "./Players";
import Box from "./ui/Box";
import Option from "./ui/Option";
import Setup from "./ui/Setup";

export default function Generate({ data, onGenerate, onStart, selection }) {
  const [setup, setSetup] = useState(false);
  const [settings, setSettings] = useState({
    mode: "Standard",
    players: 1,
    randomAspects: true,
    randomModulars: true,
  });

  const handleChange = (key) => (val) => {
    setSettings((s) => ({ ...s, [key]: val }));
  };

  const getAspects = (hero) => ({
    ...hero,
    aspects: getRandomList(ASPECTS, hero.aspects.length),
  });

  const getSideSchemes = (el) => [
    ...(el?.sideSchemes || []).map((s) => schemes[s]),
    ...(el?.nemesisSchemes || []).map((s) => schemes[s]),
  ];

  const addSideSchemes = (el) => ({
    ...el,
    sideSchemes: getSideSchemes(el),
  });

  const randomize = () => {
    const heroes = getRandomList(selection.heroes, settings.players)
      .map((hero) => data.heroes.find((h) => h.name === hero))
      .map((hero) => (settings.randomAspects ? getAspects(hero) : hero))
      .map(addSideSchemes);
    const scenarioName = getRandom(selection.scenarios);
    const scenario = data.scenarios.find((s) => s.name === scenarioName);

    const encounters = (scenario.encounter || []).map((m) => modularSets[m]);
    const defaultModular = (scenario.modular || []).map((m) => modularSets[m]);
    const availableModular = Object.values(modularSets).filter(
      (m) => !(scenario.encounter || []).includes(m.name)
    );
    const modulars = !settings.randomModulars
      ? defaultModular
      : getRandomList(availableModular, scenario.modular.length);

    setSetup({
      heroes,
      mode: settings.mode === RANDOM ? getRandom(MODES) : settings.mode,
      scenario: {
        ...scenario,
        sideSchemes: getSideSchemes(scenario),
        mainScheme: scenario.mainScheme.map((s) => schemes[s]),
        modular: [...encounters, ...modulars].map(addSideSchemes),
      },
      settings,
    });
  };

  useEffect(() => {
    if (setup) onGenerate(setup);
  }, [onGenerate, setup]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS));
    if (saved) setSettings(saved);
  }, []);

  return (
    <>
      <Box title="Players">
        <Players
          onChange={handleChange("players")}
          value={settings.players}
          max={selection.heroes.length}
        />
      </Box>
      <Box title="Mode">
        <Mode onChange={handleChange("mode")} value={settings.mode} />
      </Box>
      <Box title="Random">
        <Option
          checked={settings.randomAspects}
          label="Get random aspect"
          onChange={(e) => handleChange("randomAspects")(e.target.checked)}
        />
        <Option
          checked={settings.randomModulars}
          label="Get random modular set"
          onChange={(e) => handleChange("randomModulars")(e.target.checked)}
        />
      </Box>
      <button onClick={randomize}>Generate</button>
      {setup && (
        <>
          <Box>
            <Setup setup={setup} />
          </Box>
          <div>
            <button onClick={onStart}>Start</button>
          </div>
        </>
      )}
    </>
  );
}
