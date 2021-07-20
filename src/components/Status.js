import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { toValue } from "../utils";
import Hero from "./Hero";
import Scheme from "./Scheme";
import Villain from "./Villain";

const getCounter = (options) => {
  return {
    active: options.active || true,
    id: uuid(),
    levels: options.levels,
    name: options.name,
    parent: options.parent,
    stage: options.stage || 0,
    type: options.type,
  };
};

const getStageText = (level) => new Array(level).fill("I").join("");

const getHeroExtraCounter = (hero, counter, parent) =>
  getCounter({
    name: `${hero.name} | ${counter[0]}`,
    type: "hero-extra",
    levels: [counter],
    parent,
  });

const getVillainExtraCounter = (scenario, counter, parent) =>
  getCounter({
    name: `${scenario.villain} | ${counter[0]}`,
    type: "villain-extra",
    levels: [counter],
    parent,
  });

const getHeroCounter = (hero) => {
  const heroCounter = getCounter({
    name: hero.name,
    type: "hero",
    levels: [[hero.name, 0, hero.hitPoints]],
  });
  const extra = (hero.counters || []).map((c) =>
    getHeroExtraCounter(hero, c, heroCounter.id)
  );

  return [heroCounter, ...extra];
};

const getVillainCounter = (scenario, mode, players) => {
  const villainCounter = getCounter({
    name: scenario.villain,
    type: "villain",
    levels: scenario.stages[mode].map((s) => [
      `${scenario.villain} ${getStageText(s)}`,
      0,
      toValue(scenario.levels[s], players),
    ]),
  });
  const extra = (scenario.counters || []).map((c) =>
    getVillainExtraCounter(scenario, c, villainCounter.id)
  );

  return [villainCounter, ...extra];
};

const getMainSchemeCounter = (scenario, players) =>
  getCounter({
    name: scenario.name,
    type: "scheme-main",
    levels: scenario.mainScheme.map((s) => [
      s.name,
      toValue(s.start, players),
      toValue(s.complete, players),
    ]),
  });

const getCounters = (setup) => [
  ...setup.heroes.map(getHeroCounter).flat(),
  ...getVillainCounter(setup.scenario, setup.mode.toLowerCase(), setup.players),
  getMainSchemeCounter(setup.scenario, setup.players),
];

export default function Status({ onResult, onQuit, result, setup }) {
  const [counters, setCounters] = useState(false);

  const updateCounter = (id, values) => {
    if (!result && id)
      setCounters((cs) =>
        cs.map((c) => (c.id === id ? { ...c, ...values } : c))
      );
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("current"));
    if (saved) {
      setCounters(saved.counters);
    } else {
      setCounters(getCounters(setup));
    }
  }, [setup]);

  useEffect(() => {
    if (
      counters &&
      counters.filter((c) => c.type === "hero").every((h) => !h.active)
    ) {
      onResult("defeated", counters);
    }
    localStorage.setItem("current", JSON.stringify({ setup, counters }));
  }, [counters, onResult, setup]);

  const handleDefeat = (counter) => {
    if (counter.stage + 1 < counter.levels.length) {
      updateCounter(counter.id, { stage: counter.stage + 1 });
    } else {
      onResult("winner", counters);
    }
  };

  const handleGiveUp = () => {
    onResult("give-up", counters);
    onQuit();
  };

  const handleHeroDefeat = (counter) => () => {
    updateCounter(counter.id, { active: false });
  };

  const handleComplete = (counter) => {
    if (counter.stage + 1 < counter.levels.length) {
      updateCounter(counter.id, { stage: counter.stage + 1 });
    } else {
      onResult("scheme", counters);
    }
  };

  const handleRestart = () => {
    onResult(false);
    setCounters(getCounters(setup));
  };

  const resText = {
    defeated: "All heroes are dead!",
    "give-up": "You gave up.",
    scheme: "You lost by scheme!",
    winner: "You won!",
  }[result];

  const villainCounter = (counters || []).find((c) => c.type === "villain");

  return (
    counters && (
      <div>
        {counters
          .filter((c) => c.type === "hero")
          .map((counter) => (
            <Hero
              counter={counter}
              result={result}
              extra={counters.filter((c) => c.parent === counter.id)}
              key={counter.id}
              onDefeat={handleHeroDefeat(counter)}
              onUpdate={updateCounter}
            />
          ))}
        <Villain
          counter={villainCounter}
          extra={counters.filter((c) => c.parent === villainCounter.id)}
          result={result}
          onDefeat={handleDefeat}
          onUpdate={updateCounter}
        />
        <Scheme
          counter={counters.find((c) => c.type === "scheme-main")}
          result={result}
          onComplete={handleComplete}
          onUpdate={updateCounter}
        />
        {result ? (
          <div className={`result is-${result}`}>
            <div>{resText}</div>
            <button onClick={onQuit}>Exit</button>
            <button onClick={handleRestart}>Restart</button>
          </div>
        ) : (
          <div>
            <button onClick={handleGiveUp}>Give up</button>
            <button onClick={handleRestart}>Restart</button>
          </div>
        )}
      </div>
    )
  );
}
