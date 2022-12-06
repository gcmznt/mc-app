import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useData } from "../context/data";
import {
  countOccurrence,
  getRandom,
  getRandomList,
  getWeigths,
  load,
  persist,
  random,
  scrollTo,
} from "../utils";
import {
  ASPECTS,
  FULL_RANDOM,
  MAX_MODULAR,
  MODES,
  NO,
  NONE,
  PRECON,
  RANDOM,
  RANDOM_REPLACEMENT,
  STORAGE_KEYS,
  SUGGESTED,
} from "../utils/constants";
import { getHeroesAndAspects, getScenarioName } from "../utils/statistics";
import Heroic from "./inputs/Heroic";
import Mode from "./inputs/Mode";
import ModularSets from "./inputs/ModularSets";
import Player from "./inputs/Player";
import Players from "./inputs/Players";
import Scenario from "./inputs/Scenario";
import Skirmish from "./inputs/Skirmish";
import Box from "./ui/Box";
import Option from "./ui/Option";
import Setup from "./ui/Setup";

const initialSetting = {
  aspects1: [PRECON, PRECON, PRECON, PRECON],
  aspects2: [PRECON, PRECON, PRECON, PRECON],
  aspects3: [PRECON, PRECON, PRECON, PRECON],
  aspects4: [PRECON, PRECON, PRECON, PRECON],
  campaign: false,
  heroic: "0",
  mode: MODES[0],
  modularSets: SUGGESTED,
  modularSetsList: [],
  players: 1,
  player1: RANDOM,
  player2: RANDOM,
  player3: RANDOM,
  player4: RANDOM,
  scenario: RANDOM,
  skirmish: NO,
};

const getPreconAsp = (hero, setting) => {
  if (hero.aspects.length >= ASPECTS.length) return hero;

  const aspects = setting
    .slice(0, hero.aspects.length)
    .map((a, i) => (a === PRECON ? hero.aspects[i] : a));

  return { ...hero, aspects };
};

const pickRandomFromAvailable = (available) => (as, current, i, list) => {
  if (current === RANDOM) {
    for (let j = 0; j < available.length; j++) {
      if (![...list, ...as].includes(available[j])) {
        return [...as, ...available.splice(j, 1)];
      }
    }
  }
  return [...as, current];
};

const getAspect = (hero, allAvailable) => {
  const available =
    allAvailable ||
    ASPECTS.sort(random).filter((a) => !hero.aspects.includes(a));

  return {
    ...hero,
    aspects: hero.aspects.reduce(pickRandomFromAvailable(available), []),
  };
};

const getAllAspects = (heroesAndAspects, options) => {
  const aspects = heroesAndAspects.map((h) => h.aspects).flat();
  const available = options.differentAspects && [
    ...ASPECTS.sort(random).filter((a) => !aspects.includes(a)),
    ...ASPECTS.sort(random),
    ...ASPECTS.sort(random),
  ];

  return heroesAndAspects.map((hero) => getAspect(hero, available));
};

const getHeroes = (scenario, selection, matches, settings, options) => {
  const pl = [
    settings.player1,
    settings.player2,
    settings.player3,
    settings.player4,
  ].slice(0, settings.players);
  const sel = pl.filter((p) => p !== RANDOM);

  const getBestHeroes = () =>
    getWeigths(
      countOccurrence(
        selection.filter((h) => !sel.includes(h)),
        matches
          .map((match) =>
            new Array(
              getScenarioName(match.setup) === scenario ? matches.length : 1
            )
              .fill(getHeroesAndAspects(match.setup))
              .flat()
          )
          .map((heroes) => heroes.map((h) => h.name))
          .flat()
      )
    );

  const randomPl = getRandomList(
    options.randomWeighted
      ? getBestHeroes()
      : selection.filter((h) => !sel.includes(h)),
    settings.players - sel.length
  );

  return pl.map((p) => (p === RANDOM ? randomPl.pop() : p));
};

const filterHeroProps = (hero) => ({
  alterEgo: hero.alterEgo,
  aspects: hero.aspects,
  key: hero.key,
  name: hero.name,
});

const getScenario = (selection, matches, settings, data, options) => {
  const getBestScenarios = () =>
    getWeigths(
      countOccurrence(
        selection,
        matches.map((match) => getScenarioName(match.setup))
      )
    );

  const name =
    settings.scenario === RANDOM
      ? getRandom(options.randomWeighted ? getBestScenarios() : selection)
      : settings.scenario;
  return data.scenarios.find((s) => s.name === name);
};

const getModular = (scenario, selection, settings) => {
  switch (settings.modularSets) {
    case SUGGESTED:
      return scenario.modular.reduce((mods, curr) => {
        return Array.isArray(curr)
          ? [...mods, getRandom(curr.filter((m) => !mods.includes(m)))]
          : [...mods, curr];
      }, []);
    case NONE:
      return [];
    case FULL_RANDOM:
      return getRandomList(
        selection.filter((s) => !(scenario.encounter || []).includes(s)),
        Math.ceil(
          Math.random() * (MAX_MODULAR - (scenario.encounter?.length || 0))
        )
      );
    case RANDOM_REPLACEMENT:
      return getRandomList(
        selection.filter((s) => !(scenario.encounter || []).includes(s)),
        scenario.modular?.length || 0
      );

    default:
      const randoms = getRandomList(
        selection.filter(
          (s) =>
            ![
              ...(scenario.encounter || []),
              settings.modularSetsList.filter((m) => m !== RANDOM),
            ].includes(s)
        ),
        settings.modularSetsList.filter((m) => m === RANDOM).length
      );
      return settings.modularSetsList.map((s) =>
        s === RANDOM ? randoms.pop() : s
      );
  }
};

export default function Generate({ onStart }) {
  const { t } = useTranslation();
  const { allMatches, data, options, selection } = useData();
  const [setup, setSetup] = useState(false);
  const [settings, setSettings] = useState(false);
  const generateBtn = useRef(null);

  const handleChange = (key) => (val) => {
    setSettings((s) => ({ ...s, [key]: val }));
  };

  const randomize = () => {
    const scenario = getScenario(
      selection.scenarios,
      allMatches,
      settings,
      data,
      options
    );
    const modular = getModular(scenario, selection.modularSets, settings);
    const heroesAndAspects = getAllAspects(
      getHeroes(scenario.name, selection.heroes, allMatches, settings, options)
        .map(data.getHero)
        .map(filterHeroProps)
        .map((hero, pos) => getPreconAsp(hero, settings[`aspects${pos + 1}`])),
      options
    );

    const heroic =
      settings.heroic === RANDOM ? getRandom([0, 1, 2, 3, 4]) : settings.heroic;
    const skirmish =
      settings.skirmish === RANDOM ? getRandom([1, 2, 3]) : settings.skirmish;

    setSetup({
      heroesAndAspects,
      mode: settings.mode === RANDOM ? getRandom(MODES) : settings.mode,
      heroic,
      scenarioName: scenario.name,
      modularSets: [...(scenario.encounter || []), ...modular],
      settings,
      skirmish,
    });

    if (!setup) setTimeout(() => scrollTo(generateBtn.current), 0);
  };

  useEffect(() => {
    setup.settings && persist(STORAGE_KEYS.SETTINGS, setup.settings);
  }, [setup.settings]);

  useEffect(() => {
    load(STORAGE_KEYS.SETTINGS).then((saved) => {
      if (!saved) return setSettings(initialSetting);
      setSettings({
        ...initialSetting,
        ...saved,
        players:
          saved.players > selection.heroes.length || saved.players <= 0
            ? selection.heroes.length
            : saved.players,
      });
    });
  }, [selection.heroes.length]);

  return !settings ? null : (
    <>
      <Box title={t("Scenario")} key="Scenario">
        <Scenario
          onChange={handleChange("scenario")}
          value={settings.scenario}
        />
        <Option
          checked={settings.campaign}
          label="Campaign"
          onChange={(e) => handleChange("campaign")(e.target.checked)}
        />
        <ModularSets
          onChange={handleChange}
          value={settings.modularSets}
          list={settings.modularSetsList}
        />
      </Box>
      <Box title={t("Players")} key="Players">
        <Players
          onChange={handleChange("players")}
          value={settings.players}
          max={selection.heroes.length}
        />
        <legend className="box__legend">{t("Heroes")}</legend>
        {[1, 2, 3, 4]
          .filter((p) => settings.players >= p)
          .map((pos) => (
            <Player
              key={pos}
              onChange={handleChange}
              pos={pos}
              settings={settings}
            />
          ))}
      </Box>
      <Box title={t("Mode")} key="Mode">
        <Mode onChange={handleChange("mode")} value={settings.mode} />
        <Heroic onChange={handleChange("heroic")} value={settings.heroic} />
        <Skirmish
          onChange={handleChange("skirmish")}
          value={settings.skirmish}
        />
      </Box>
      <button
        ref={generateBtn}
        onClick={randomize}
        disabled={!settings.players}
      >
        {t("Generate")}
      </button>
      {setup && (
        <Box key="Setup" type="accent">
          <Setup setup={setup} />
        </Box>
      )}
      {setup && <button onClick={() => onStart(setup)}>{t("Start")}</button>}
    </>
  );
}
