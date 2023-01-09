import { calculateEmissionsFactor } from "../utils/calculator/calculateEmissionsFactor";
import fs from "fs-extra";
import { emissionsFactorItem } from "../utils/types";

/*
Generating table for emissionsFactors
**/
const generateEmissionsFactorTable = async () => {
  // accessing GasUsed.json & Hashrate.json
  const GasUsedJSON = fs.readFileSync("data/GasUsed.json", {
    encoding: "utf-8",
  });
  const GasUsedObj = JSON.parse(GasUsedJSON);

  const HashrateJSON = fs.readFileSync("data/Hashrate.json", {
    encoding: "utf-8",
  });
  const HashrateObj = JSON.parse(HashrateJSON);

  let arr: emissionsFactorItem[] = [];

  // creating daily entries of emissionsFactors
  for (let i = 0; i < GasUsedObj.length; i++) {
    // if gasUsed is 0, emissionsFactor is also 0
    const emissionsFactor =
      GasUsedObj[i].Value == 0
        ? 0
        : calculateEmissionsFactor(GasUsedObj[i].Value, HashrateObj[i].Value);

    let obj: emissionsFactorItem = {
      "Date(UTC)": GasUsedObj[i]["Date(UTC)"],
      UnixTimeStamp: GasUsedObj[i]["UnixTimeStamp"],
      emissionsFactor: emissionsFactor.toString(),
    };

    arr.push(obj);
  }

  fs.outputFileSync("data/EmissionsFactors.json", JSON.stringify(arr));
};

generateEmissionsFactorTable();
