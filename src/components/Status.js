import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { toValue } from "../utils";
import Counter from "./Counter";
import Log, { EVENTS } from "./Log";
import Box from "./ui/Box";
import Option from "./ui/Option";

const getResText = (result) =>
  ({
    defeated: "All heroes are dead!",
    "give-up": "You gave up.",
    scheme: "You lost by scheme!",
    winner: "You won!",
  }[result]);

const getCounter = (options) => {
  return {
    active: typeof options.active !== "undefined" ? options.active : true,
    id: uuid(),
    levels: options.levels,
    initialLevels: options.levels,
    name: options.name,
    parent: options.parent,
    stage: options.stage || 0,
    type: options.type,
  };
};

const getStageText = (level) => new Array(level).fill("I").join("");

const getFullCounter = (name, type, levels, children) => {
  const parentCounter = getCounter({
    name,
    type,
    levels,
  });
  const extra = (children || []).map((c) =>
    getCounter({
      name: `${name} | ${c[0]}`,
      type: `${type}-extra`,
      levels: [c],
      parent: parentCounter.id,
    })
  );

  return [parentCounter, ...extra];
};

const getHeroCounter = (players) => (hero) =>
  [
    ...getFullCounter(
      hero.name,
      "hero",
      [[hero.name, 0, hero.hitPoints]],
      hero.counters
    ),
    ...hero.nemesisSchemes.map((s) =>
      getCounter({
        active: false,
        name: `${hero.name} | ${s.name}`,
        type: "nemesis-scheme",
        levels: [
          [s.name, toValue(s.start, players), toValue(s.complete, players)],
        ],
      })
    ),
  ];

const getVillainCounter = (scenario, mode, players) => [
  ...getFullCounter(
    scenario.villain,
    "villain",
    scenario.stages[mode].map((s) => [
      `${scenario.villain} ${getStageText(s)}`,
      0,
      toValue(scenario.levels[s], players),
    ]),
    scenario.counters
  ),
  ...scenario.sideSchemes.map((s) =>
    getCounter({
      active: false,
      name: `${scenario.villain} | ${s.name}`,
      type: "side-scheme",
      levels: [
        [s.name, toValue(s.start, players), toValue(s.complete, players)],
      ],
    })
  ),
  ...scenario.modular
    .map((mod) =>
      mod.sideSchemes.map((s) =>
        getCounter({
          active: false,
          name: `${mod.name} | ${s.name}`,
          type: "modular-scheme",
          levels: [
            [s.name, toValue(s.start, players), toValue(s.complete, players)],
          ],
        })
      )
    )
    .flat(),
];

const getMainSchemeCounter = (scenario, players) =>
  getFullCounter(
    scenario.name,
    "scenario",
    scenario.mainScheme.map((s) => [
      s.name,
      toValue(s.start, players),
      toValue(s.complete, players),
      toValue(s.advance, players),
    ]),
    ...scenario.mainScheme.filter((s) => s.counters).map((s) => s.counters)
  );

const getCounters = (setup) => [
  ...setup.heroes.map(getHeroCounter(setup.players)).flat(),
  ...getVillainCounter(setup.scenario, setup.mode.toLowerCase(), setup.players),
  ...getMainSchemeCounter(setup.scenario, setup.players),
];

export default function Status({ onResult, onQuit, result, setup }) {
  const [counters, setCounters] = useState(false);
  const [log, setLog] = useState([]);
  const [interacted, setInteracted] = useState(false);

  const logEvent = (event, entity, data) => {
    setLog((l) => [
      { id: uuid(), date: new Date(), event, entity, data },
      ...l,
    ]);
  };

  const updateCounter = (id, values) => {
    setInteracted(true);
    if (!result && id)
      setCounters((cs) =>
        cs.map((c) => (c.id === id ? { ...c, ...values } : c))
      );
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("current"));
    if (saved) {
      setCounters(saved.counters);
      setLog(saved.log.map((l) => ({ ...l, date: new Date(l.date) })));
    } else {
      setCounters(getCounters(setup));
      logEvent(EVENTS.START, "match");
    }
  }, [setup]);

  useEffect(() => {
    if (
      counters &&
      counters.filter((c) => c.type === "hero").every((h) => !h.active)
    ) {
      onResult("defeated", counters);
    }
    interacted && window.navigator.vibrate(50);
    localStorage.setItem(
      "current",
      JSON.stringify({ counters, log, result, setup })
    );
  }, [counters, interacted, log, onResult, result, setup]);

  useEffect(() => {
    result &&
      interacted &&
      logEvent(EVENTS.END, "match", { result, resultText: getResText(result) });
  }, [interacted, result]);

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

  const handleCompleteSide = (counter) => {
    updateCounter(counter.id, { active: false, levels: counter.initialLevels });
  };

  const handleEnableSide = (counter) => {
    logEvent(EVENTS.ENTER, counter.id, counter);
    updateCounter(counter.id, { active: true });
  };

  const handleRestart = () => {
    onResult(false);
    setLog([]);
    setCounters(getCounters(setup));
    logEvent(EVENTS.RESTART, "match");
  };

  const defaultCounterProps = {
    logEvent: logEvent,
    onUpdate: updateCounter,
    result: result,
  };

  const villainCounter = (counters || []).find((c) => c.type === "villain");
  const mainScheme = (counters || []).find((c) => c.type === "scenario");
  const sideSchemes = (counters || []).filter((c) =>
    ["modular-scheme", "nemesis-scheme", "side-scheme"].includes(c.type)
  );
  const activeSideSchemes = (sideSchemes || []).filter((c) => c.active);

  console.log(mainScheme);

  return (
    counters && (
      <div>
        {counters
          .filter((c) => c.type === "hero")
          .map((counter) => (
            <Box
              key={counter.id}
              title={counter.levels[counter.stage][0]}
              type="hero"
            >
              <Counter
                counter={counter}
                lastLabel="💀"
                title="Hits"
                onComplete={handleHeroDefeat(counter)}
                {...defaultCounterProps}
              />
              {counters
                .filter((c) => c.parent === counter.id)
                .map((c) => (
                  <Counter counter={c} key={c.id} {...defaultCounterProps} />
                ))}
            </Box>
          ))}
        <Box title={villainCounter.levels[villainCounter.stage][0]}>
          <Counter
            counter={villainCounter}
            lastLabel="💀"
            title="Hits"
            onComplete={handleDefeat}
            {...defaultCounterProps}
          />
          {counters
            .filter((c) => c.parent === villainCounter.id)
            .map((c) => (
              <Counter counter={c} key={c.id} {...defaultCounterProps} />
            ))}
        </Box>
        <Box title={mainScheme.levels[mainScheme.stage][0]} type="scheme">
          <Counter
            counter={mainScheme}
            onComplete={handleComplete}
            title="Threats"
            {...defaultCounterProps}
          />
          {counters
            .filter((c) => c.parent === mainScheme.id)
            .map((c) => (
              <Counter counter={c} key={c.id} {...defaultCounterProps} />
            ))}
        </Box>

        <Box title="Side schemes" flat type="scheme">
          {activeSideSchemes.map((c) => (
            <Counter
              counter={c}
              key={c.id}
              over={true}
              onComplete={handleCompleteSide}
              onEnable={handleEnableSide}
              {...defaultCounterProps}
            />
          ))}
        </Box>
        <Box title="Other side schemes" flat flag type="scheme">
          {sideSchemes.map((c) => (
            <Option
              key={c.id}
              checked={c.active}
              label={c.name}
              onChange={() => handleEnableSide(c)}
              value={c.name}
            />
          ))}
        </Box>
        {result ? (
          <div className={`result is-${result}`}>
            <div>{getResText(result)}</div>
            <button onClick={onQuit}>Exit</button>
            <button onClick={handleRestart}>Restart</button>
          </div>
        ) : (
          <div>
            <button onClick={handleGiveUp}>Give up</button>
            <button onClick={handleRestart}>Restart</button>
          </div>
        )}
        <Log log={log} />
      </div>
    )
  );
}
