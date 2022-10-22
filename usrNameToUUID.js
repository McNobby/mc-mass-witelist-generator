const fs = require("fs");
const axios = require("axios");

let txtData = "";

try {
  txtData = fs.readFileSync("./names.txt", "utf8");
} catch (err) {
  console.error(err);
}

// Make the txt file into an array
let aryUserNames = [];
try {
  aryUserNames = txtData.split("\n");
} catch (err) {
  console.log(err);
}

// Fetches UUIDs from the minecraft api and maps them with the uuid
let aryWhitelist = aryUserNames.map((strUsername) => {
  return axios
    .get("https://playerdb.co/api/player/minecraft/" + strUsername.trim())
    .then((objResponse) => {
      const { data } = objResponse;

      if (data.code === 400) {
        return null;
      }
      const objPlayer = data.data.player;

      return { uuid: objPlayer.id, name: objPlayer.username };
    })
    .catch((err) => {
      console.error(
        `Code: ${err.code}\nusername not found: ${strUsername}\nIgnoring it`
      );
    });
});

Promise.all(aryWhitelist).then((aryWhitelist) => {
  // Remove null values
  aryWhitelist = aryWhitelist.filter((e) => e !== undefined && e !== null);
  let strWhitelist = JSON.stringify(aryWhitelist).replace(/(\r\n|\n|\r)/gm, "");

  fs.writeFileSync("whitelist.json", strWhitelist);
  console.log("Done! Succsessfully wrote to /whitelist.json");
});
