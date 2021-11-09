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
import { ASPECTS, MODES, RANDOM, STORAGE_KEYS } from "../utils/constants";
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
  heroic: "0",
  mode: "Standard",
  players: 1,
  player1: RANDOM,
  player2: RANDOM,
  player3: RANDOM,
  player4: RANDOM,
  randomAspects: true,
  randomWeighted: true,
  randomModulars: true,
  scenario: RANDOM,
  skirmish: "None",
};

const getAspects = (hero, random) => ({
  ...hero,
  aspects: random ? getRandomList(ASPECTS, hero.aspects.length) : hero.aspects,
});

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
  const [settings, setSettings] = useState(initialSetting);
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
      .map((hero) => getAspects(hero, settings.randomAspects))
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
      if (saved)
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

  return (
    <>
      <Box title={t("Scenario")} key="Scenario" flag>
        <Scenario
          onChange={handleChange("scenario")}
          value={settings.scenario}
        />
      </Box>
      <Box title={t("Players")} key="Players" flag>
        <Players
          onChange={handleChange("players")}
          value={settings.players}
          max={selection.heroes.length}
        />
        <legend class="box__legend">{t("Heroes")}</legend>
        {settings.players >= 1 && (
          <Player
            onChange={handleChange("player1")}
            pos={1}
            value={settings.player1}
          />
        )}
        {settings.players >= 2 && (
          <Player
            onChange={handleChange("player2")}
            pos={2}
            value={settings.player2}
          />
        )}
        {settings.players >= 3 && (
          <Player
            onChange={handleChange("player3")}
            pos={3}
            value={settings.player3}
          />
        )}
        {settings.players >= 4 && (
          <Player
            onChange={handleChange("player4")}
            pos={4}
            value={settings.player4}
          />
        )}
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
          checked={settings.randomAspects}
          label="Get random hero aspect"
          onChange={(e) => handleChange("randomAspects")(e.target.checked)}
        />
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
