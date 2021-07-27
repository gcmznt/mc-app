import { COUNTER_TYPES, RESULT_TYPES } from "./constants";

export const getTokenCount = (type, count) => {
  const tokenName =
    {
      [COUNTER_TYPES.MODULAR_SCHEME]: "thread",
      [COUNTER_TYPES.NEMESIS_SCHEME]: "thread",
      [COUNTER_TYPES.SCENARIO]: "thread",
      [COUNTER_TYPES.SIDE_SCHEME]: "thread",
    }[type] || "token";

  if (count === 1) return `1 ${tokenName}`;
  return `${count} ${tokenName}s`;
};

export const getAddTokenText = (type, count) =>
  ({
    [COUNTER_TYPES.HERO]: `Hitted${count > 1 ? ` × ${count}` : ""}`,
    [COUNTER_TYPES.VILLAIN]: `Hitted${count > 1 ? ` × ${count}` : ""}`,
  }[type] || `Added ${getTokenCount(type, count)}`);

export const getRemoveTokenText = (type, count) =>
  ({
    [COUNTER_TYPES.HERO]: `Healed${count > 1 ? ` × ${count}` : ""}`,
    [COUNTER_TYPES.VILLAIN]: `Healed${count > 1 ? ` × ${count}` : ""}`,
  }[type] || `Removed ${getTokenCount(type, count)}`);

export const getIncreaseText = (count) =>
  `Increased limit${count > 1 ? ` × ${count}` : ""}`;

export const getDecreaseText = (count) =>
  `Limit decreased${count > 1 ? ` × ${count}` : ""}`;

export const getCompleteText = (type) =>
  ({
    [COUNTER_TYPES.HERO]: "Defeated",
    [COUNTER_TYPES.MODULAR_SCHEME]: "Cleared",
    [COUNTER_TYPES.NEMESIS_SCHEME]: "Cleared",
    [COUNTER_TYPES.SIDE_SCHEME]: "Cleared",
    [COUNTER_TYPES.VILLAIN]: "Defeated",
  }[type] || "Complete");

export const getStageName = (counter) => counter.levels[counter.stage].name;
export const getStageText = (level) =>
  isNaN(level) ? level : new Array(level).fill("I").join("");

export const getResText = (result) =>
  ({
    [RESULT_TYPES.DEFEATED]: "All heroes are dead!",
    [RESULT_TYPES.GIVE_UP]: "You gave up.",
    [RESULT_TYPES.SCHEME_WIN]: "You win by scheme!",
    [RESULT_TYPES.SCHEME]: "You lost by scheme.",
    [RESULT_TYPES.WINNER]: "You won!",
  }[result]);
