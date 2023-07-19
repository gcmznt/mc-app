const { readFile } = require("./files");

// function getPropByString(obj, propString) {
//   return propString?.split(".").reduce((acc, curr) => acc?.[curr], obj);
// }

function readTranslationsFile(language, pack) {
  return [pack, `${pack}_encounter`]
    .map((p) =>
      readFile(`${process.env.DB_PATH}translations/${language}/pack/${p}.json`)
    )
    .flat()
    .flat()
    .filter((c) => c);
}

function getTranslation(lang, keys) {
  return (card) => {
    // console.log(card, readTranslationsFile(lang, card.pack_code));
    return keys.map((key) => [
      card[key],
      readTranslationsFile(lang, card.pack_code)?.find(
        (c) => c.code === card.code
      )?.[key],
    ]);
  };
}

function getTranslations(getFn, lang, keys) {
  return Object.fromEntries(getFn().map(getTranslation(lang, keys)).flat());
}

module.exports = {
  getTranslations,
};
