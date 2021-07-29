import { useEffect, useState } from "react";
import schemes from "../data/schemes.json";
import { getRandom, getRandomList, load, persist } from "../utils";
import { ASPECTS, MODES, RANDOM, STORAGE_KEYS } from "../utils/constants";
import Mode from "./Mode";
import Players from "./Players";
import Box from "./ui/Box";
import Option from "./ui/Option";
import Setup from "./ui/Setup";
import logo from "../images/logo.svg";

const initialSetting = {
  mode: "Standard",
  players: 1,
  randomAspects: true,
  randomCumulative: true,
  randomModulars: true,
};

export default function Generate({ data, onGenerate, onStart, selection }) {
  const [lastHeroes, setLastHeroes] = useState(false);
  const [setup, setSetup] = useState(false);
  const [settings, setSettings] = useState(initialSetting);

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

  const getHeroes = () => {
    const possible = settings.randomCumulative
      ? selection.heroes.filter((hero) => !lastHeroes.includes(hero))
      : selection.heroes;

    return getRandomList(
      possible.length >= settings.players
        ? possible
        : [
            ...possible,
            ...getRandomList(
              selection.heroes,
              settings.players - possible.length,
              possible
            ),
          ],
      settings.players
    );
  };

  const randomize = () => {
    const heroes = getHeroes()
      .map((hero) => data.heroes.find((h) => h.name === hero))
      .map((hero) => (settings.randomAspects ? getAspects(hero) : hero))
      .map(addSideSchemes);
    const scenarioName = getRandom(selection.scenarios);
    const scenario = data.scenarios.find((s) => s.name === scenarioName);

    const modular = settings.randomModulars
      ? getRandomList(
          selection.modularSets,
          scenario.modular.length,
          scenario.encounter
        )
      : scenario.modular;

    setSetup({
      heroes,
      mode: settings.mode === RANDOM ? getRandom(MODES) : settings.mode,
      scenario: {
        ...scenario,
        sideSchemes: getSideSchemes(scenario),
        mainScheme: scenario.mainScheme.map((s) => schemes[s]),
        modular: [...(scenario.encounter || []), ...modular]
          .map((m) => data.modularSets[m])
          .map(addSideSchemes),
      },
      settings,
    });
  };

  const handleStart = () => {
    if (lastHeroes.length + setup.heroes.length <= selection.heroes.length) {
      persist(STORAGE_KEYS.LAST_HEROES, [
        ...lastHeroes,
        ...setup.heroes.map((hero) => hero.name),
      ]);
    } else {
      persist(
        STORAGE_KEYS.LAST_HEROES,
        setup.heroes
          .filter((hero) => lastHeroes.includes(hero.name))
          .map((hero) => hero.name)
      );
    }
    onStart();
  };

  useEffect(() => {
    if (setup) onGenerate(setup);
  }, [onGenerate, setup]);

  useEffect(() => {
    const saved = load(STORAGE_KEYS.SETTINGS);
    const lh = load(STORAGE_KEYS.LAST_HEROES);
    if (saved) setSettings({ ...initialSetting, ...saved });
    setLastHeroes(lh || []);
  }, []);

  return (
    <>
      <img src={logo} alt="logo" style={{ height: 140, width: 140 }} />
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
        <Option
          checked={settings.randomCumulative}
          label="Exclude last used heroes"
          onChange={(e) => handleChange("randomCumulative")(e.target.checked)}
        />
      </Box>
      <button onClick={randomize}>Generate</button>
      {setup && (
        <>
          <Box>
            <Setup setup={setup} />
          </Box>
          <div>
            <button onClick={handleStart}>Start</button>
          </div>
        </>
      )}
    </>
  );
}
