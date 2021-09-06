import { useEffect, useRef, useState } from "react";
import schemes from "../data/schemes.json";
import { getRandom, getRandomList, load, persist } from "../utils";
import { ASPECTS, MODES, RANDOM, STORAGE_KEYS } from "../utils/constants";
import Heroic from "./Heroic";
import Mode from "./Mode";
import Players from "./Players";
import Skirmish from "./Skirmish";
import Box from "./ui/Box";
import Option from "./ui/Option";
import Setup from "./ui/Setup";

const initialSetting = {
  heroic: 0,
  mode: "Standard",
  players: 1,
  randomAspects: true,
  randomCumulative: true,
  randomModulars: true,
  skirmish: "None",
};

export default function Generate({ data, onGenerate, onStart, selection }) {
  const [lastHeroes, setLastHeroes] = useState(false);
  const [setup, setSetup] = useState(false);
  const [settings, setSettings] = useState(initialSetting);
  const generateBtn = useRef(null);

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
      heroic:
        settings.heroic === RANDOM
          ? getRandom([0, 1, 2, 3, 4])
          : settings.heroic,
      scenario: {
        ...scenario,
        sideSchemes: getSideSchemes(scenario),
        mainScheme: scenario.mainScheme.map((s) => ({
          ...schemes[s],
          children: (schemes[s].children || []).map((c) => schemes[c]),
        })),
        modular: [...(scenario.encounter || []), ...modular]
          .map((m) => data.modularSets[m])
          .map(addSideSchemes),
      },
      settings,
      skirmish:
        settings.skirmish === RANDOM ? getRandom([1, 2, 3]) : settings.skirmish,
    });

    if (!setup) {
      setTimeout(
        () =>
          generateBtn.current.scrollIntoView({
            block: "start",
            inline: "nearest",
            behavior: "smooth",
          }),
        0
      );
    }
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
      <Box title="Players" key="Players">
        <Players
          onChange={handleChange("players")}
          value={settings.players}
          max={selection.heroes.length}
        />
      </Box>
      <Box title="Mode" key="Mode">
        <Mode onChange={handleChange("mode")} value={settings.mode} />
        <Heroic onChange={handleChange("heroic")} value={settings.heroic} />
        <Skirmish
          onChange={handleChange("skirmish")}
          value={settings.skirmish}
        />
      </Box>
      <Box title="Random" key="Random">
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
      <button ref={generateBtn} onClick={randomize}>
        Generate
      </button>
      {setup && (
        <Box key="Setup">
          <Setup setup={setup} />
        </Box>
      )}
      {setup && <button onClick={handleStart}>Start</button>}
    </>
  );
}
