import { useEffect, useState } from "react";
import { Route } from "wouter";
import { v4 as uuid } from "uuid";

import Generate from "./components/Generate";
import Match from "./components/Match";
import Options from "./components/Options";
import Statistics from "./components/Statistics";

import { useData } from "./context/data";
import { clear, load } from "./utils";
import { PAGES, STORAGE_KEYS } from "./utils/constants";

import Logo from "./components/ui/Logo";
import Menu from "./components/ui/Menu";

export default function App() {
  const { options } = useData();
  const [setup, setSetup] = useState(false);
  const [matchId, setMatchId] = useState(false);

  const handleStart = (setup) => {
    setup && setSetup(setup);
    setMatchId(uuid());
  };

  const handleQuit = (replay = false) => {
    setMatchId(false);
    clear(STORAGE_KEYS.CURRENT);
    replay ? handleStart() : setSetup(false);
  };

  useEffect(() => {
    const saved = load(STORAGE_KEYS.CURRENT);
    if (saved) {
      setSetup(saved.setup);
      setMatchId(saved.matchId);
    }
  }, []);

  useEffect(() => {
    document.body.classList.remove("is-auto", "is-dark", "is-light");
    document.body.classList.add(`is-${options.mode}`);
  }, [options.mode]);

  return (
    <main className={options.compact ? "use-compact" : ""}>
      {matchId ? (
        <Match
          key={matchId}
          matchId={matchId}
          onQuit={handleQuit}
          setup={setup}
        />
      ) : (
        <>
          <Logo />
          <Menu />

          <Route path={PAGES.MAIN}>
            <Generate onStart={handleStart} />
          </Route>

          <Route path={PAGES.STATISTICS}>
            <Statistics onLoad={handleStart} />
          </Route>

          <Route path={PAGES.OPTIONS}>
            <Options />
          </Route>
        </>
      )}
    </main>
  );
}
