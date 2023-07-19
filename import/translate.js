const { getUpgrades, getSupports } = require("./utils/cards");
const { readTranslationFile } = require("./utils/translations");

[
  ["upgrades", getUpgrades, ["name"]],
  ["supports", getSupports, ["name"]],
].forEach(([type, getFn]) => {
  const data = getFn();
  fs.writeFile(
    `./src/data/${type}.json`,
    JSON.stringify(data, null, "\t"),
    () => {}
  );
  console.log(Object.fromEntries(data.map(getTranslation("it", "name"))));
});
