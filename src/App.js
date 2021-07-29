import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import Generate from "./components/Generate";
import Match from "./components/Match";
import Options from "./components/Options";
import Statistics from "./components/Statistics";
import Actions, { Action } from "./components/ui/Actions";
import heroes from "./data/heroes.json";
import modularSets from "./data/modular-sets.json";
import scenarios from "./data/scenarios.json";
import { clear, load, persist } from "./utils";
import { PAGES, STORAGE_KEYS } from "./utils/constants";

const data = { heroes, modularSets, scenarios };
const fullSelect = {
  heroes: heroes.map((h) => h.name),
  modularSets: Object.keys(modularSets),
  scenarios: scenarios.map((h) => h.name),
};
const defOptions = {
  mode: "auto",
  timer: true,
};

export default function App() {
  const [page, setPage] = useState(PAGES.MAIN);
  const [selection, setSelection] = useState({
    heroes: [],
    modularSets: [],
    scenarios: [],
  });
  const [setup, setSetup] = useState(false);
  const [matchId, setMatchId] = useState(false);
  // const [wakeLock, setWakeLock] = useState(false);
  const [options, setOptions] = useState(defOptions);

  const showOptions = () => {
    setPage(PAGES.OPTIONS);
  };

  const saveOptions = () => {
    persist(STORAGE_KEYS.SELECTION, selection);
    setSetup(false);
    setPage(PAGES.MAIN);
  };

  const handleGeneration = (setup) => {
    setMatchId(false);
    setSetup(setup);
    persist(STORAGE_KEYS.SETTINGS, setup.settings);
  };

  const handleQuit = () => {
    setMatchId(false);
    setSetup(false);
    clear(STORAGE_KEYS.CURRENT);
  };

  const handleStart = () => {
    setMatchId(uuid());
  };

  const handleOptionChange = (key) => (val) => {
    setOptions((opts) => ({ ...opts, [key]: val }));
  };

  useEffect(() => {
    setOptions(load(STORAGE_KEYS.OPTIONS) || defOptions);
    setSelection(load(STORAGE_KEYS.SELECTION) || fullSelect);
    const saved = load(STORAGE_KEYS.CURRENT);
    if (saved) {
      setMatchId(saved.matchId);
      setSetup(saved.setup);
    }
  }, []);

  useEffect(() => {
    document.body.classList.remove("is-auto", "is-dark", "is-light");
    document.body.classList.add(`is-${options.mode}`);
  }, [options.mode]);

  useEffect(() => {
    persist(STORAGE_KEYS.OPTIONS, options);
  }, [options]);

  // useEffect(() => {
  //   if ("wakeLock" in navigator) {
  //     if (matchId) {
  //       navigator.wakeLock
  //         .request("screen")
  //         .then(setWakeLock)
  //         .catch(console.error);
  //     } else if (wakeLock) {
  //       wakeLock.release().then(() => setWakeLock(false));
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [matchId]);

  // useEffect(() => {
  //   const resetLock = () => {
  //     if (wakeLock !== false && document.visibilityState === "visible") {
  //       navigator.wakeLock
  //         .request("screen")
  //         .then(setWakeLock)
  //         .catch(console.error);
  //     }
  //   };
  //   document.addEventListener("visibilitychange", resetLock);

  //   return () => document.removeEventListener("visibilitychange", resetLock);
  // }, [wakeLock]);

  return (
    <main>
      {page === PAGES.OPTIONS && (
        <Options
          onChangeOptions={handleOptionChange}
          data={data}
          fullSelect={fullSelect}
          options={options}
          selection={selection}
          onChange={setSelection}
        />
      )}
      {page === PAGES.STATISTICS && (
        <Statistics onBack={() => setPage(PAGES.MAIN)} />
      )}
      {page === PAGES.MAIN && !matchId && (
        <Generate
          data={data}
          onGenerate={handleGeneration}
          onStart={handleStart}
          selection={selection}
        />
      )}
      {page === PAGES.MAIN && matchId && (
        <Match
          key={matchId}
          matchId={matchId}
          onQuit={handleQuit}
          options={options}
          setup={setup}
        />
      )}
      {page === PAGES.MAIN && !matchId && (
        <Actions>
          <Action
            label="Statistics"
            onClick={() => setPage(PAGES.STATISTICS)}
          />
          <Action label="Options" onClick={showOptions} />
        </Actions>
      )}
      {page === PAGES.OPTIONS && (
        <Actions>
          <Action label="Save" onClick={saveOptions} />
        </Actions>
      )}
    </main>
  );
}
