import { createContext, useContext } from "react";

import heroes from "../data/heroes.json";
import modularSets from "../data/modular-sets.json";
import scenarios from "../data/scenarios.json";
import schemes from "../data/schemes.json";

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
  return (
    <DataContext.Provider value={{ data, fullSelect }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
