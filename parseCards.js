const fs = require("fs");
const packs = require("json-data/packs");
const sets = require("json-data/sets");
const minionsAddons = require("./src/data/addons/minions.json");

const encounterPacks = packs
  .map((pack) => require(`json-data/pack/${pack.code}_encounter`))
  .flat();

const isMinion = (card) => card.type_code === "minion";
const isSideScheme = (card) => card.type_code === "side_scheme";
const isModular = (set) => set.card_set_type_code === "modular";

const getMinion = (card) => ({
  name: card.name,
  set_code: card.set_code,
  hitPoints: card.health_per_hero ? `${card.health}p` : card.health,
  ...(card.text && card.text.toLowerCase().includes("toughness")
    ? { status: ["Tough"] }
    : {}),
});

const getModular = (set) => ({
  name: set.name,
  code: set.code,
});

const getHinder = (text = "") => {
  const h = /hinder (?<hinder>\d+)/g.exec(text.toLowerCase());
  if (h && h.groups.hinder) return [`${h.groups.hinder}p`];

  const add =
    /place an additional (?<hinder>\d+)( ?)\[per_hero\] threat here/g.exec(
      text.toLowerCase()
    );
  if (add && add.groups.hinder) return [`${add.groups.hinder}p`];

  // console.log(text);
  // return "2p";
};

const getSideScheme = (scheme) => ({
  name: scheme.name,
  set_code: scheme.set_code,
  start: scheme.base_threat_fixed
    ? [scheme.base_threat, ...(getHinder(scheme.text) || [])]
    : `${scheme.base_threat}p`,
  icons: [
    ...new Array(scheme.scheme_acceleration || 0).fill("Acceleration"),
    ...new Array(scheme.scheme_amplify || 0).fill("Amplify"),
    ...new Array(scheme.scheme_crisis || 0).fill("Crisis"),
    ...new Array(scheme.scheme_hazard || 0).fill("Hazard"),
  ],
});

const mergeAddons = (acc, curr) => ({
  ...acc,
  [`${curr.name}|${curr.set_code}`]: acc[`${curr.name}|${curr.set_code}`]
    ? { ...acc[`${curr.name}|${curr.set_code}`], ...curr }
    : curr,
});

const addMinions = (minions) => (set) => ({
  ...set,
  minions: minions.filter((m) => m.set_code === set.code).map((m) => m.name),
});

const addSideSchemes = (sideSchemes) => (set) => ({
  ...set,
  sideSchemes: sideSchemes
    .filter((m) => m.set_code === set.code)
    .map((m) => new Array(m.quantity || 1).fill(m.name))
    .flat(),
});

const minions = Object.values(
  [...encounterPacks.filter(isMinion).map(getMinion), ...minionsAddons].reduce(
    mergeAddons,
    {}
  )
);

const sideSchemes = encounterPacks.filter(isSideScheme).map(getSideScheme);

const modular = sets
  .filter(isModular)
  .map(getModular)
  .map(addMinions(minions))
  .map(addSideSchemes(sideSchemes));

// console.log(sideSchemes);

const save = (name, data) => {
  fs.writeFile(`./src/data/${name}.json`, JSON.stringify(data), function (err) {
    if (err) return console.log(err);
    console.log(`${name} saved`);
  });
};

save("minions", minions);
save("modular-sets", modular);
save("side-schemes", sideSchemes);
