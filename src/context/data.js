import { createContext, useContext, useEffect, useMemo, useState } from "react";

import heroes from "../data/heroes.json";
import minions from "../data/minions.json";
import modularSets from "../data/modular-sets.json";
import scenarios from "../data/scenarios.json";
import schemes from "../data/schemes.json";

import { append, appendList, load, persist } from "../utils";
import { DEFAULT_OPTIONS, STORAGE_KEYS } from "../utils/constants";
import { getMatchStats } from "../utils/statistics";

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
  const [stats, setStats] = useState([]);
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
    if (!match) {
      appendList(
        STORAGE_KEYS.TO_DELETE,
        stats.map((m) => m.matchId)
      );
      persist(STORAGE_KEYS.MATCHES, []).then(setAllMatches);
      persist(STORAGE_KEYS.STATISTICS, []).then(setStats);
    } else if (matches.some((m) => m.matchId === match.matchId)) {
      persist(
        STORAGE_KEYS.MATCHES,
        allMatches.filter((m) => m.matchId !== match.matchId)
      ).then(setAllMatches);
    } else if (stats.some((m) => m.matchId === match.matchId)) {
      append(STORAGE_KEYS.TO_DELETE, match.matchId);
      persist(
        STORAGE_KEYS.STATISTICS,
        stats.filter((m) => m.matchId !== match.matchId)
      ).then(setStats);
    }
  };

  const saveStats = (matches) => {
    return persist(
      STORAGE_KEYS.STATISTICS,
      matches.map((match) => getMatchStats(match))
    ).then(setStats);
  };

  const saveMatch = (match) => {
    persist(STORAGE_KEYS.MATCHES, [
      ...allMatches.filter((m) => m.matchId !== match.matchId),
      match,
    ]).then(setAllMatches);
  };

  const clearStats = () => {
    persist(STORAGE_KEYS.STATISTICS, []).then(setStats);
  };

  const clear = () => {
    persist(STORAGE_KEYS.MATCHES, []).then(setAllMatches);
    persist(STORAGE_KEYS.TO_DELETE, []);
  };

  const getMinion = (name) => {
    return data.minions.find((m) => name === m.name);
  };

  useEffect(() => {
    Promise.all([
      load(STORAGE_KEYS.MATCHES),
      load(STORAGE_KEYS.STATISTICS),
      load(STORAGE_KEYS.OPTIONS),
      load(STORAGE_KEYS.SELECTION),
    ]).then(([ms, stats, opts, sel]) => {
      setAllMatches(ms || []);
      setStats(stats || []);
      setOptions(opts || DEFAULT_OPTIONS);

      const check = (k) =>
        fullSelection[k].filter((el) => (sel || fullSelection)[k].includes(el));
      setSelection({
        heroes: check("heroes"),
        modularSets: check("modularSets"),
        scenarios: check("scenarios"),
      });
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
        clear,
        clearStats,
        data,
        deleteMatch,
        fullSelection,
        getMinion,
        matches,
        options,
        saveMatch,
        saveStats,
        selection,
        stats,
        updateOption,
        updateSelection,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
