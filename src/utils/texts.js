import { COUNTER_TYPES, RESULT_TYPES } from "./constants";

export const getAddTokenText = (type, count) =>
  ({
    [COUNTER_TYPES.HERO]: "Hit",
    [COUNTER_TYPES.VILLAIN]: "Hit",
    [COUNTER_TYPES.MODULAR_SCHEME]: "Add thread",
    [COUNTER_TYPES.NEMESIS_SCHEME]: "Add thread",
    [COUNTER_TYPES.SCENARIO]: "Add thread",
    [COUNTER_TYPES.SIDE_SCHEME]: "Add thread",
  }[type] || "Increase");

export const getRemoveTokenText = (type, count) =>
  ({
    [COUNTER_TYPES.HERO]: "Heal",
    [COUNTER_TYPES.VILLAIN]: "Heal",
    [COUNTER_TYPES.MODULAR_SCHEME]: "Remove thread",
    [COUNTER_TYPES.NEMESIS_SCHEME]: "Remove thread",
    [COUNTER_TYPES.SCENARIO]: "Remove thread",
    [COUNTER_TYPES.SIDE_SCHEME]: "Remove thread",
  }[type] || "Decrease");

export const getCompleteText = (type) =>
  ({
    [COUNTER_TYPES.HERO]: "💀",
    [COUNTER_TYPES.ALLY]: "Defeated",
    [COUNTER_TYPES.MINION]: "Defeated",
    [COUNTER_TYPES.MODULAR_SCHEME]: "Cleared",
    [COUNTER_TYPES.NEMESIS_SCHEME]: "Cleared",
    [COUNTER_TYPES.SIDE_SCHEME]: "Cleared",
    [COUNTER_TYPES.VILLAIN]: "💀",
  }[type] || "Complete");

export const getStageText = (level) => {
  return isNaN(level) ? level : new Array(+level).fill("I").join("");
};

export const getResText = (result) =>
  ({
    [RESULT_TYPES.DEFEATED]: "All heroes are dead!",
    [RESULT_TYPES.GIVE_UP]: "You gave up.",
    [RESULT_TYPES.SCHEME_WIN]: "You win by scheme!",
    [RESULT_TYPES.SCHEME]: "You lost by scheme.",
    [RESULT_TYPES.WINNER]: "You won!",
  }[result]);

export const resultText = (result) =>
  ({
    [RESULT_TYPES.DEFEATED]: "Lost | All Heroes Defeated",
    [RESULT_TYPES.GIVE_UP]: "Lost | Gave up",
    [RESULT_TYPES.SCHEME_WIN]: "Won | Main scheme",
    [RESULT_TYPES.SCHEME]: "Lost | Main Scheme",
    [RESULT_TYPES.WINNER]: "Won | Villain defeated",
  }[result]);
