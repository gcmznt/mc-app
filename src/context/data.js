import { createContext, useContext, useEffect, useMemo, useState } from "react";

import allies from "../data/allies.json";
import heroes from "../data/heroes.json";
import minions from "../data/minions.json";
import modularSets from "../data/modular-sets.json";
import scenarios from "../data/scenarios.json";
import mainSchemes from "../data/main-schemes.json";
import sideSchemes from "../data/side-schemes.json";
import supports from "../data/supports.json";
import upgrades from "../data/upgrades.json";

import { append, appendList, load, persist } from "../utils";
import { DEFAULT_OPTIONS, STORAGE_KEYS } from "../utils/constants";
import { byDate, getMatchInfo, getMatchStats } from "../utils/statistics";

const isActive = (match) => !match.trash;

const isEnabled = (el) =>
  !el.disabled ||
  window.location.hostname === "localhost" ||
  new URL(document.location).searchParams.get("debug") === "";

const byName = (a, c) => ({ ...a, [c.name]: c });

const byKey = (key) => (el) => (el.key || el.name) === key;

const data = {
  allies,
  heroes: heroes.filter(isEnabled),
  minions,
  modularSets: modularSets.reduce(byName, {}),
  scenarios: scenarios.filter(isEnabled),
  mainSchemes: mainSchemes.reduce(byName, {}),
  sideSchemes: sideSchemes.reduce(byName, {}),
  supports: supports.reduce(byName, {}),
  upgrades: upgrades.reduce(byName, {}),
  getAlly: (key) => allies.find(byKey(key)),
  getHero: (key) => heroes.find(byKey(key)),
  getMainScheme: (key) => mainSchemes.find(byKey(key)),
  getMinion: (key) => minions.find(byKey(key)),
  getSideScheme: (key) => sideSchemes.find(byKey(key)),
};

const fullSelection = {
  heroes: data.heroes.map((h) => h.key || h.name),
  modularSets: Object.keys(data.modularSets),
  scenarios: data.scenarios.map((h) => h.name),
};

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [stats, setStats] = useState(false);
  const [matches, setMatches] = useState(false);
  const [selection, setSelection] = useState(fullSelection);
  const [options, setOptions] = useState(false);

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
      return Promise.all([
        persist(STORAGE_KEYS.MATCHES, []).then(setMatches),
        persist(STORAGE_KEYS.STATISTICS, []).then(setStats),
      ]);
    } else if (matches.some((m) => m.matchId === match.matchId)) {
      return persist(
        STORAGE_KEYS.MATCHES,
        matches.filter((m) => m.matchId !== match.matchId)
      ).then(setMatches);
    } else if (stats.some((m) => m.matchId === match.matchId)) {
      append(STORAGE_KEYS.TO_DELETE, match.matchId);
      return persist(
        STORAGE_KEYS.STATISTICS,
        stats.filter((m) => m.matchId !== match.matchId)
      ).then(setStats);
    }
  };

  const saveStats = (matches) => {
    return persist(STORAGE_KEYS.STATISTICS, matches.map(getMatchStats)).then(
      setStats
    );
  };

  const exportStats = (matches) => {
    return matches.map(getMatchInfo).sort(byDate);
  };

  const saveMatch = (match) => {
    persist(STORAGE_KEYS.MATCHES, [
      ...matches.filter((m) => m.matchId !== match.matchId),
      match,
    ]).then(setMatches);
  };

  const clearStats = () => {
    persist(STORAGE_KEYS.STATISTICS, []).then(setStats);
  };

  const clear = () => {
    persist(STORAGE_KEYS.MATCHES, []).then(setMatches);
    persist(STORAGE_KEYS.TO_DELETE, []);
  };

  useEffect(() => {
    Promise.all([
      load(STORAGE_KEYS.MATCHES),
      load(STORAGE_KEYS.STATISTICS),
      load(STORAGE_KEYS.OPTIONS),
      load(STORAGE_KEYS.SELECTION),
    ]).then(([ms, stats, opts, sel]) => {
      setMatches(ms || []);
      setStats(stats || []);
      setOptions({ ...DEFAULT_OPTIONS, ...opts });

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

  const activeMatches = useMemo(
    () => matches && matches.filter(isActive),
    [matches]
  );
  const allMatches = useMemo(
    () => matches && stats && [...matches, ...stats],
    [matches, stats]
  );

  return (
    <DataContext.Provider
      value={{
        allMatches,
        clear,
        clearStats,
        data,
        deleteMatch,
        exportStats,
        fullSelection,
        matches: activeMatches,
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
