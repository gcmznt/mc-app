import { useEffect, useState } from "react";
import Generate from "./components/Generate";
import Match from "./components/Match";
import Options from "./components/Options";
import Fab from "./components/ui/Fab";
import heroes from "./data/heroes.json";
import scenarios from "./data/scenarios.json";
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
  const [started, setStarted] = useState(false);
  const [wakeLock, setWakeLock] = useState(false);

  const showOptions = () => {
    setOptions(true);
  };

  const saveOptions = () => {
    localStorage.setItem(STORAGE_KEYS.SELECTION, JSON.stringify(selection));
    setSetup(false);
    setOptions(false);
  };

  const handleGeneration = (setup) => {
    setStarted(false);
    setSetup(setup);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(setup.settings));
  };

  const handleQuit = () => {
    setStarted(false);
    setSetup(false);
    localStorage.removeItem(STORAGE_KEYS.CURRENT);
  };
  const handleStart = () => setStarted(true);

  useEffect(() => {
    setSelection(
      JSON.parse(localStorage.getItem(STORAGE_KEYS.SELECTION)) || fullSelect
    );
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT));
    if (saved) {
      setStarted(true);
      setSetup(saved.setup);
    }
  }, []);

  useEffect(() => {
    if ("wakeLock" in navigator) {
      if (started) {
        navigator.wakeLock
          .request("screen")
          .then(setWakeLock)
          .catch(console.error);
      } else if (wakeLock) {
        wakeLock.release().then(() => setWakeLock(false));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

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
    <main>
      {options && (
        <Options data={data} selection={selection} onChange={setSelection} />
      )}
      {!options && !started && (
        <Generate
          data={data}
          onGenerate={handleGeneration}
          onStart={handleStart}
          selection={selection}
        />
      )}
      {!options && started && (
        <Match onQuit={handleQuit} initialSetup={setup} />
      )}
      {!started && (
        <Fab
          label={options ? "Save" : "Options"}
          onClick={options ? saveOptions : showOptions}
        />
      )}
    </main>
  );
}
