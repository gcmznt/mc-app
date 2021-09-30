import { createContext, useContext, useEffect, useState } from "react";

import heroes from "../data/heroes.json";
import modularSets from "../data/modular-sets.json";
import scenarios from "../data/scenarios.json";
import schemes from "../data/schemes.json";
import { appendList, load, persist } from "../utils";
import { STORAGE_KEYS } from "../utils/constants";

const isEnabled = (el) =>
  !el.disabled || window.location.hostname === "localhost";

const data = {
  heroes: heroes.filter(isEnabled),
  modularSets,
  scenarios: scenarios.filter(isEnabled),
  schemes,
};
const fullSelect = {
  heroes: data.heroes.map((h) => h.name),
  modularSets: Object.keys(data.modularSets),
  scenarios: data.scenarios.map((h) => h.name),
};

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [matches, setMatches] = useState([]);

  const deleteMatch = (match) => {
    appendList(
      STORAGE_KEYS.TO_SYNC,
      match ? [match.matchId] : matches.map((m) => m.matchId)
    );
    setMatches(
      persist(
        STORAGE_KEYS.MATCHES,
        matches.map((m) =>
          !match || m.matchId === match.matchId ? { ...m, trash: true } : m
        )
      )
    );
  };

  const saveMatch = (match) => {
    setMatches((matches) =>
      persist(STORAGE_KEYS.MATCHES, [
        ...matches.filter((m) => m.matchId !== match.matchId),
        match,
      ])
    );
  };

  useEffect(() => {
    setMatches(load(STORAGE_KEYS.MATCHES) || []);
  }, []);

  return (
    <DataContext.Provider
      value={{ data, deleteMatch, fullSelect, matches, saveMatch }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
