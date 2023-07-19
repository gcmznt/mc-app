const { readFile } = require("./files");
const { findMatch, getIcons, getSchemeStart } = require("./helpers");

const packs = require(`${process.env.DB_PATH}packs.json`);
const sets = require(`${process.env.DB_PATH}sets.json`);
const factions = require(`${process.env.DB_PATH}factions.json`);
let cards;

function getCardSet(card) {
  return (
    sets.find((set) => set.code === card.set_code)?.name ||
    card.set_code ||
    factions.find((faction) => faction.code === card.faction_code)?.name ||
    card.faction_code
  );
}

function getPackName(card) {
  return packs.find((pack) => pack.code === card.pack_code)?.name;
}

function baseInfo(card) {
  return { code: card.code, name: card.name, set: getCardSet(card) };
}

function isTough(card) {
  return card.text?.includes("Toughness") && { status: ["Tough"] };
}

const alliesCountersREs = [
  /(enters play with )(?<start>\d+) (?<name>[\w\s]+) counter/,
  /place (?<start>\d+) (?<name>[\w\s]+) counter on (him|her)/,
  /place up to (?<start>\d+) (?<name>[\w\s]+) counters here/,
];

const heroesCountersREs = [
  /(?<!moving [\w]*)(?<name>[\w]+) counter([\w\s]* \(to a maximum of (?<max>[\d]+)\))/,
  /(?<!moving [\w]*)(?<name>[\w]+) counter/,
];

const upgradesCountersREs = [/(?<start>\d+) (?<tokenName>[\w\s]+) counter/];

const allyMap = (card) => ({
  ...baseInfo(card),
  ...isTough(card),
  counters: card.text && findMatch(alliesCountersREs, card.text),
  hitPoints: card.health,
  subname: card.subname,
  pack_code: card.pack_code,
});

const heroMap = (card) => {
  const alterEgo = cards.find((c) => c.code === card.back_link);
  return {
    code: card.code,
    name: card.name,
    alterEgo: alterEgo.name,
    hitPoints: card.health,
    pack: getPackName(card),
    pack_code: card.pack_code,
    counters: findMatch(heroesCountersREs, alterEgo.text + card.text),
  };
};

const minionMap = (card) => ({
  ...baseInfo(card),
  ...isTough(card),
  hitPoints: card.health,
  pack_code: card.pack_code,
});

const mainSchemeMap = (card) => ({
  ...baseInfo(card),
  icons: getIcons(card),
  start: getSchemeStart(card),
  complete: card.threat && `${card.threat}p`,
  step: card.escalation_threat && `${card.escalation_threat}p`,
  stage: card.stage,
  pack_code: card.pack_code,
});

const sideSchemeMap = (card) => ({
  ...baseInfo(card),
  icons: getIcons(card),
  start: getSchemeStart(card),
  pack_code: card.pack_code,
});

const upgradeMap = (card) => ({
  ...baseInfo(card),
  ...findMatch(upgradesCountersREs, card.text)[0],
  pack_code: card.pack_code,
});
const supportMap = upgradeMap;

function readPackFiles(pack) {
  return [pack.code, `${pack.code}_encounter`]
    .map((p) => readFile(`${process.env.DB_PATH}pack/${p}.json`))
    .flat();
}

function getAllCards() {
  if (!cards) {
    cards = packs
      .map(readPackFiles)
      .flat()
      .filter((c) => c);
  }
  return cards;
}

function getCards(type, formatFn, filterFn) {
  return getAllCards()
    .filter((card) => card.type_code === type && (!filterFn || filterFn(card)))
    .map(formatFn);
}

function getAllies() {
  return getCards("ally", allyMap);
}

function getHeroes() {
  const withBackLink = (card) => card.back_link;
  const removeDuplicates = (hs, hero) => {
    if (hs.find((h) => h.name === hero.name && h.alterEgo === hero.alterEgo))
      return hs;
    return [...hs, hero];
  };

  return getCards("hero", heroMap, withBackLink).reduce(removeDuplicates, []);
}

function getMinions() {
  return getCards("minion", minionMap);
}

function getMainSchemes() {
  return getCards("main_scheme", mainSchemeMap);
}

function getSideSchemes() {
  return getCards("side_scheme", sideSchemeMap);
}

function getUpgrades() {
  return getCards("upgrade", upgradeMap, (card) => card.text?.includes("Uses"));
}

function getSupports() {
  return getCards("support", supportMap, (card) => card.text?.includes("Uses"));
}

module.exports = {
  getAllies,
  getHeroes,
  getMinions,
  getMainSchemes,
  getSideSchemes,
  getSupports,
  getUpgrades,
};
