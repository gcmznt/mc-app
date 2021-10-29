const https = require("https");
const fs = require("fs");

https
  .get("https://marvelcdb.com/api/public/cards/", (resp) => {
    let data = "";

    resp.on("data", (chunk) => {
      data += chunk;
    });

    resp.on("end", () =>
      fs.writeFile("cards.json", data, function (err) {
        if (err) return console.log(err);
        console.log("Cards saved");
      })
    );
  })
  .on("error", (err) => {
    console.log("Error: " + err.message);
  });
