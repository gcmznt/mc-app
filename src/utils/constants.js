export const COUNTER_TYPES = {
  ACCELERATION: "acceleration",
  ALLY: "ally",
  CUSTOM: "custom",
  HERO_TOKEN: "hero-token",
  HERO: "hero",
  MINION: "minion",
  MODULAR_SCHEME: "modular-scheme",
  NEMESIS_SCHEME: "nemesis-scheme",
  PHASES: "phases",
  ROUNDS: "rounds",
  SCENARIO_TOKEN: "scenario-token",
  SCENARIO: "scenario",
  SIDE_SCHEME: "side-scheme",
  SUPPORT: "support",
  UPGRADE: "upgrade",
  VILLAIN_EXTRA: "villain-extra",
  VILLAIN: "villain",
};

export const COUNTERS_SCHEME = [
  COUNTER_TYPES.MODULAR_SCHEME,
  COUNTER_TYPES.NEMESIS_SCHEME,
  COUNTER_TYPES.SIDE_SCHEME,
];

export const STATUSES = ["Confused", "Stunned", "Tough"];

export const EVENTS = {
  COMPLETE: "complete",
  CREATE: "create",
  DECREASE_LIMIT: "decrease-limit",
  DECREASE: "decrease",
  DISABLE: "disable",
  EMPTY: "empty",
  END: "end",
  ENTER_MINION: "enter-minion",
  ENTER_SCHEME: "enter-scheme",
  ENTER: "enter",
  FLIP_COUNTER: "flip-counter",
  HIT: "hit",
  INCREASE_FROM: "increase-from",
  INCREASE_LIMIT: "increase-limit",
  INCREASE: "increase",
  LOCK: "lock",
  LOST_SCHEME: "lost-scheme",
  NEW_PHASE: "new-phase",
  NEW_ROUND: "new-round",
  NEXT: "next",
  RESET: "reset",
  RESTART: "restart",
  SET: "set",
  START: "start",
  STATUS_DISABLE: "status-disable",
  STATUS_ENABLE: "status-enable",
  UNLOCK: "unlock",
  VILLAIN_PHASE: "villain-phase",
};

export const TRIGGER_MAP = {
  [EVENTS.ENTER_MINION]: EVENTS.ENTER,
  [EVENTS.ENTER_SCHEME]: EVENTS.ENTER,
  [EVENTS.FLIP_COUNTER]: EVENTS.ENTER,
};

export const MODIFIERS = {
  HIT_POINTS: "hit-points",
  RENAME: "rename",
};

export const RESULT_TYPES = {
  WINNER: "winner",
  SCHEME_WIN: "scheme-win",
  DEFEATED: "defeated",
  SCHEME: "scheme",
  GIVE_UP: "give-up",
};

export const STORAGE_KEYS = {
  CURRENT: "current",
  DEVICE: "device",
  LAST_SYNC: "last-sync",
  MATCHES: "matches",
  OPTIONS: "options",
  SELECTION: "selection",
  SETTINGS: "settings",
  SETUP: "setup",
  THEME: "theme",
  TO_SYNC: "to-sync",
};

export const PAGES = {
  MAIN: "/",
  OPTIONS: "/options",
  STATISTICS: "/statistics",
};

export const DEFAULT_OPTIONS = {
  compact: false,
  language: "en",
  mode: "auto",
  timer: true,
};

export const ASPECTS = ["Aggression", "Justice", "Leadership", "Protection"];
export const MODES = ["Standard", "Expert"];
export const RANDOM = "Random";

export const FILTERS = {
  ASPECT: "aspect",
  HERO: "hero",
  MODES: "modes",
  MODULAR: "modularSets",
  PLAYERS: "players",
  RESULT: "result",
  SCENARIO: "scenario",
};
