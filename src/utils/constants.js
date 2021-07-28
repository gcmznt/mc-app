export const COUNTER_TYPES = {
  ACCELERATION: "acceleration",
  CUSTOM: "custom",
  HERO: "hero",
  MODULAR_SCHEME: "modular-scheme",
  NEMESIS_SCHEME: "nemesis-scheme",
  SCENARIO: "scenario",
  SIDE_SCHEME: "side-scheme",
  VILLAIN: "villain",
};

export const COUNTERS_SCHEME = [
  COUNTER_TYPES.MODULAR_SCHEME,
  COUNTER_TYPES.NEMESIS_SCHEME,
  COUNTER_TYPES.SIDE_SCHEME,
];

export const EVENTS = {
  COMPLETE: "complete",
  DEC_LIMIT: "decrease-limit",
  DECREASE: "decrease",
  DISABLE: "disable",
  END: "end",
  ENTER: "enter",
  INC_LIMIT: "increase-limit",
  INCREASE: "increase",
  NEXT: "next",
  PREVIOUS: "previous",
  RESTART: "restart",
  START: "start",
  STATUS_ENABLE: "status-enable",
  STATUS_DISABLE: "status-disable",
  VILLAIN_PHASE: "villain-phase",
};

export const RESULT_TYPES = {
  DEFEATED: "defeated",
  GIVE_UP: "give-up",
  SCHEME_WIN: "scheme-win",
  SCHEME: "scheme",
  WINNER: "winner",
};

export const STORAGE_KEYS = {
  CURRENT: "current",
  LAST_HEROES: "last-heroes",
  MATCHES: "matches",
  OPTIONS: "options",
  SELECTION: "selection",
  SETTINGS: "settings",
  SETUP: "setup",
  THEME: "theme",
};

export const PAGES = {
  MAIN: "main",
  OPTIONS: "options",
};

export const ASPECTS = ["Aggression", "Justice", "Leadership", "Protection"];
export const MODES = ["Standard", "Expert"];
export const RANDOM = "Random";
