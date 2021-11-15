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
} from "../utils";
import {
  ASPECTS,
  MODES,
  PRECON,
  RANDOM,
  STORAGE_KEYS,
} from "../utils/constants";
import { getHeroesAndAspects, getScenarioName } from "../utils/statistics";
import Heroic from "./inputs/Heroic";
import Mode from "./inputs/Mode";
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
  mode: "Standard",
  players: 1,
  player1: RANDOM,
  player2: RANDOM,
  player3: RANDOM,
  player4: RANDOM,
  randomWeighted: true,
  randomModulars: true,
  scenario: RANDOM,
  skirmish: "None",
};

const getAspects = (hero, setting) => {
  if (hero.aspects.length >= ASPECTS.length) return hero;

  const set = setting
    .slice(0, hero.aspects.length)
    .map((a, i) => (a === PRECON ? hero.aspects[i] : a));
  const available = getRandomList(ASPECTS, ASPECTS.length).filter(
    (a) => !set.includes(a)
  );

  return {
    ...hero,
    aspects: set.map((a) => (a === RANDOM ? available.pop() : a)),
  };
};

const getHeroes = (scenario, selection, matches, settings) => {
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
    settings.randomWeighted
      ? getBestHeroes()
      : selection.filter((h) => !sel.includes(h)),
    settings.players - sel.length
  );

  return pl.map((p) => (p === RANDOM ? randomPl.pop() : p));
};

const getScenario = (selection, matches, settings, data) => {
  const getBestScenarios = () =>
    getWeigths(
      countOccurrence(
        selection,
        matches.map((match) => getScenarioName(match.setup))
      )
    );

  const name =
    settings.scenario === RANDOM
      ? getRandom(settings.randomWeighted ? getBestScenarios() : selection)
      : settings.scenario;
  return data.scenarios.find((s) => s.name === name);
};

const getModular = (scenario, selection, settings) => {
  return settings.randomModulars
    ? getRandomList(
        selection.filter((s) => !(scenario.encounter || []).includes(s)),
        (scenario.modular || []).length
      )
    : scenario.modular;
};

export default function Generate({ onStart }) {
  const { t } = useTranslation();
  const { allMatches, data, selection } = useData();
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
      data
    );
    const modular = getModular(scenario, selection.modularSets, settings);
    const heroesAndAspects = getHeroes(
      scenario.name,
      selection.heroes,
      allMatches,
      settings
    )
      .map((hero) => data.heroes.find((h) => h.name === hero))
      .map((hero, pos) => getAspects(hero, settings[`aspects${pos + 1}`]))
      .map((hero) => ({ name: hero.name, aspects: hero.aspects }));

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
      <Box title={t("Scenario")} key="Scenario" flag>
        <Scenario
          onChange={handleChange("scenario")}
          value={settings.scenario}
        />
        <Option
          checked={settings.campaign}
          label="Campaign"
          onChange={(e) => handleChange("campaign")(e.target.checked)}
        />
      </Box>
      <Box title={t("Players")} key="Players" flag>
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
      <Box title={t("Mode")} key="Mode" flag>
        <Mode onChange={handleChange("mode")} value={settings.mode} />
        <Heroic onChange={handleChange("heroic")} value={settings.heroic} />
        <Skirmish
          onChange={handleChange("skirmish")}
          value={settings.skirmish}
        />
      </Box>
      <Box title={t("Random")} key="Random">
        <Option
          checked={settings.randomModulars}
          label="Get random modular set"
          onChange={(e) => handleChange("randomModulars")(e.target.checked)}
        />
        <Option
          checked={settings.randomWeighted}
          label="Heroes and scenario weighted random"
          onChange={(e) => handleChange("randomWeighted")(e.target.checked)}
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
        <Box key="Setup">
          <Setup setup={setup} />
        </Box>
      )}
      {setup && <button onClick={() => onStart(setup)}>{t("Start")}</button>}
    </>
  );
}
