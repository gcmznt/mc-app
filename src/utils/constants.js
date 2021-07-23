export const COUNTER_TYPES = {
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
  DECREASE_LIMIT: "decrease-limit",
  DECREASE: "decrease",
  END: "end",
  ENTER: "enter",
  INCREASE_LIMIT: "increase-limit",
  INCREASE: "increase",
  NEXT: "next",
  PREVIOUS: "previous",
  RESTART: "restart",
  START: "start",
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
  SELECTION: "selection",
  SETTINGS: "settings",
};

export const ASPECTS = ["Aggression", "Justice", "Leadership", "Protection"];
export const MODES = ["Standard", "Expert"];
export const RANDOM = "Random";
