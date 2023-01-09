import fs from "fs-extra";
import csv from "csvtojson";

/*
Generates json files from `GasedUsed.csv` & `Hashrate.csv`
**/
csv()
  .fromFile("data/GasUsed.csv")
  .then((jsonObj) => {
    fs.outputFileSync("data/GasUsed.json", JSON.stringify(jsonObj));
  });

csv()
  .fromFile("data/Hashrate.csv")
  .then((jsonObj) => {
    fs.outputFileSync("data/Hashrate.json", JSON.stringify(jsonObj));
  });
