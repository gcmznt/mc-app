import { createContext, useContext, useEffect, useMemo, useState } from "react";

import heroes from "../data/heroes.json";
import minions from "../data/minions.json";
import modularSets from "../data/modular-sets.json";
import scenarios from "../data/scenarios.json";
import schemes from "../data/schemes.json";

import { appendList, load, persist } from "../utils";
import { DEFAULT_OPTIONS, STORAGE_KEYS } from "../utils/constants";

const isEnabled = (el) =>
  !el.disabled || window.location.hostname === "localhost";

const data = {
  heroes: heroes.filter(isEnabled),
  minions,
  modularSets: modularSets.reduce((a, c) => ({ ...a, [c.name]: c }), {}),
  scenarios: scenarios.filter(isEnabled),
  schemes: schemes.reduce((a, c) => ({ ...a, [c.name]: c }), {}),
};

const fullSelection = {
  heroes: data.heroes.map((h) => h.name),
  modularSets: Object.keys(data.modularSets),
  scenarios: data.scenarios.map((h) => h.name),
};

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [allMatches, setAllMatches] = useState([]);
  const [selection, setSelection] = useState(fullSelection);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);

  const updateSelection = (key, value) => {
    setSelection({ ...selection, [key]: value });
  };

  const updateOption = (key, value) => {
    setOptions((opts) => ({ ...opts, [key]: value }));
  };

  const deleteMatch = (match) => {
    appendList(
      STORAGE_KEYS.TO_SYNC,
      match ? [match.matchId] : allMatches.map((m) => m.matchId)
    );
    setAllMatches(
      persist(
        STORAGE_KEYS.MATCHES,
        allMatches.map((m) =>
          !match || m.matchId === match.matchId ? { ...m, trash: true } : m
        )
      )
    );
  };

  const saveMatch = (match) => {
    setAllMatches((allMatches) =>
      persist(STORAGE_KEYS.MATCHES, [
        ...allMatches.filter((m) => m.matchId !== match.matchId),
        match,
      ])
    );
  };

  const getMinion = (name) => {
    return data.minions.find((m) => name === m.name);
  };

  useEffect(() => {
    setAllMatches(load(STORAGE_KEYS.MATCHES) || []);
    setOptions(load(STORAGE_KEYS.OPTIONS) || DEFAULT_OPTIONS);

    const sel = load(STORAGE_KEYS.SELECTION) || fullSelection;
    const check = (k) => fullSelection[k].filter((el) => sel[k].includes(el));
    setSelection({
      heroes: check("heroes"),
      modularSets: check("modularSets"),
      scenarios: check("scenarios"),
    });
  }, []);

  useEffect(() => {
    persist(STORAGE_KEYS.SELECTION, selection);
  }, [selection]);

  useEffect(() => {
    persist(STORAGE_KEYS.OPTIONS, options);
  }, [options]);

  const matches = useMemo(
    () => allMatches.filter((m) => !m.trash),
    [allMatches]
  );

  return (
    <DataContext.Provider
      value={{
        data,
        deleteMatch,
        fullSelection,
        getMinion,
        matches,
        options,
        saveMatch,
        selection,
        updateOption,
        updateSelection,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
