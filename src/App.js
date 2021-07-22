import { useEffect, useState } from "react";
import Generate from "./components/Generate";
import Match from "./components/Match";
import Options from "./components/Options";
import Fab from "./components/ui/Fab";
import heroes from "./data/heroes.json";
import scenarios from "./data/scenarios.json";

const data = { heroes, scenarios };

export default function App() {
  const [options, setOptions] = useState(false);
  const [selection, setSelection] = useState({ heroes: [], scenarios: [] });
  const [setup, setSetup] = useState(false);
  const [started, setStarted] = useState(false);
  const [wakeLock, setWakeLock] = useState(false);

  const saveOptions = () => {
    localStorage.setItem("selection", JSON.stringify(selection));
    setSetup(false);
    setOptions(false);
  };

  const handleGeneration = (settings) => {
    setStarted(false);
    setSetup(settings);
  };

  const handleQuit = () => {
    setStarted(false);
    setSetup(false);
    localStorage.removeItem("current");
  };
  const handleStart = () => setStarted(true);

  useEffect(() => {
    setSelection(JSON.parse(localStorage.getItem("selection")) || data);
    const saved = JSON.parse(localStorage.getItem("current"));
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
        <>
          <Options data={data} selection={selection} onChange={setSelection} />
          <Fab label="Save" onClick={saveOptions} />
        </>
      )}
      {!options && !started && (
        <>
          <Generate onGenerate={handleGeneration} selection={selection} />
          <Fab label="Options" onClick={() => setOptions(true)} />
        </>
      )}
      {!options && setup && (
        <Match
          onQuit={handleQuit}
          onStart={handleStart}
          initialSetup={setup}
          started={started}
        />
      )}
    </main>
  );
}
