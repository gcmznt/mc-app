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
  ALLY_DEFEATED: "ally-defeated",
  COMPLETE: "complete",
  CREATE: "create",
  DECREASE_LIMIT: "decrease-limit",
  DECREASE: "decrease",
  DISABLE: "disable",
  EMPTY: "empty",
  END: "end",
  ENTER_ALLY: "enter-ally",
  ENTER_MINION: "enter-minion",
  ENTER_SCHEME: "enter-scheme",
  ENTER_SUPPORT: "enter-support",
  ENTER_UPGRADE: "enter-upgrade",
  ENTER: "enter",
  FIRST_PLAYER: "first-player",
  FLIP: "flip",
  FLIP_COUNTER: "flip-counter",
  FLIP_HERO: "flip-hero",
  FLIP_VILLAIN: "flip-villain",
  HIT: "hit",
  INCREASE_FROM: "increase-from",
  INCREASE_LIMIT: "increase-limit",
  INCREASE: "increase",
  LOCK: "lock",
  LOST_SCHEME: "lost-scheme",
  MINION_DEFEATED: "minion-defeated",
  NEW_PHASE: "new-phase",
  NEW_ROUND: "new-round",
  NEXT: "next",
  RESET: "reset",
  RESTART: "restart",
  SET: "set",
  SIDE_CLEARED: "side-cleared",
  START: "start",
  STATUS_DISABLE: "status-disable",
  STATUS_ENABLE: "status-enable",
  UNLOCK: "unlock",
  VILLAIN_PHASE: "villain-phase",
};

export const TRIGGER_MAP = {
  [EVENTS.ENTER_ALLY]: EVENTS.ENTER,
  [EVENTS.ENTER_MINION]: EVENTS.ENTER,
  [EVENTS.ENTER_SCHEME]: EVENTS.ENTER,
  [EVENTS.ENTER_SUPPORT]: EVENTS.ENTER,
  [EVENTS.ENTER_UPGRADE]: EVENTS.ENTER,
  [EVENTS.ALLY_DEFEATED]: EVENTS.DISABLE,
  [EVENTS.MINION_DEFEATED]: EVENTS.DISABLE,
  [EVENTS.SIDE_CLEARED]: EVENTS.DISABLE,
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
  LAST_SYNC: "last-sync",
  MATCHES: "matches",
  OPTIONS: "options",
  SELECTION: "selection",
  SETTINGS: "settings",
  SETUP: "setup",
  STATISTICS: "statistics",
  THEME: "theme",
  TO_DELETE: "to-delete",
};

export const PAGES = {
  MAIN: "/",
  MATCH: "/match/:matchId",
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
