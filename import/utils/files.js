const fs = require("fs");

function readFile(fileName) {
  try {
    if (fs.existsSync(fileName)) return require(fileName);
  } catch (err) {
    return null;
  }
}

module.exports = {
  readFile,
};
