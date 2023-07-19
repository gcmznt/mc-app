const fs = require("fs");

const { getAllies, getMinions, getHeroes } = require("./utils/cards");
const { getTranslations } = require("./utils/translations");

// const data = getHeroes();
// const data = getTranslations(getAllies, "it", ["name", "subname"]);
const data = getTranslations(getHeroes, "it", ["name", "alterEgo"]);
// const data = getTranslations(getMinions, "it", ["name"]);
fs.writeFile("./import/test.json", JSON.stringify(data, null, 2), (err) => {});
console.log(data.length);
