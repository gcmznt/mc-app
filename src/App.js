import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import Generate from "./components/Generate";
import Match from "./components/Match";
import Options from "./components/Options";
import Fab from "./components/ui/Fab";
import heroes from "./data/heroes.json";
import scenarios from "./data/scenarios.json";
import { clear, load, persist } from "./utils";
import { STORAGE_KEYS } from "./utils/constants";

const data = { heroes, scenarios };
const fullSelect = {
  heroes: heroes.map((h) => h.name),
  scenarios: scenarios.map((h) => h.name),
};

export default function App() {
  const [options, setOptions] = useState(false);
  const [selection, setSelection] = useState({ heroes: [], scenarios: [] });
  const [setup, setSetup] = useState(false);
  const [matchId, setMatchId] = useState(false);
  const [wakeLock, setWakeLock] = useState(false);
  const [mode, setMode] = useState("auto");

  const showOptions = () => {
    setOptions(true);
  };

  const saveOptions = () => {
    persist(STORAGE_KEYS.SELECTION, selection);
    setSetup(false);
    setOptions(false);
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

  const handleModeChange = (mode) => {
    setMode(mode);
  };

  useEffect(() => {
    setMode(load(STORAGE_KEYS.THEME) || "auto");
    setSelection(load(STORAGE_KEYS.SELECTION) || fullSelect);
    const saved = load(STORAGE_KEYS.CURRENT);
    if (saved) {
      setMatchId(saved.matchId);
      setSetup(saved.setup);
    }
  }, []);

  useEffect(() => {
    persist(STORAGE_KEYS.THEME, mode);
    document.body.classList.remove("is-auto", "is-dark", "is-light");
    document.body.classList.add(`is-${mode}`);
  }, [mode]);

  useEffect(() => {
    if ("wakeLock" in navigator) {
      if (matchId) {
        navigator.wakeLock
          .request("screen")
          .then(setWakeLock)
          .catch(console.error);
      } else if (wakeLock) {
        wakeLock.release().then(() => setWakeLock(false));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  useEffect(() => {
    const resetLock = () => {
      if (wakeLock !== false && document.visibilityState === "visible") {
        navigator.wakeLock
          .request("screen")
          .then(setWakeLock)
          .catch(console.error);
      }
    };
    document.addEventListener("visibilitychange", resetLock);

    return () => document.removeEventListener("visibilitychange", resetLock);
  }, [wakeLock]);

  return (
    <main className={mode !== "auto" ? `is-${mode}` : ""}>
      {options && (
        <Options
          changeMode={handleModeChange}
          data={data}
          mode={mode}
          selection={selection}
          onChange={setSelection}
        />
      )}
      {!options && !matchId && (
        <Generate
          data={data}
          onGenerate={handleGeneration}
          onStart={handleStart}
          selection={selection}
        />
      )}
      {!options && matchId && (
        <Match
          key={matchId}
          matchId={matchId}
          onQuit={handleQuit}
          setup={setup}
        />
      )}
      {!matchId && (
        <Fab
          label={options ? "Save" : "Options"}
          onClick={options ? saveOptions : showOptions}
        />
      )}
    </main>
  );
}
