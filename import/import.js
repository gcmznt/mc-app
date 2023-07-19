const fs = require("fs");

const { getUpgrades, getSupports } = require("./utils/cards");

[
  ["upgrades", getUpgrades],
  ["supports", getSupports],
].forEach(([type, getFn]) => {
  fs.writeFile(
    `./src/data/${type}.json`,
    JSON.stringify(getFn(), null, "\t"),
    () => {}
  );
});
