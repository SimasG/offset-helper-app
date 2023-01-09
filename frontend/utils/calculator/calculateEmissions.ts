import fs from "fs-extra";
import { getTransactions } from "./getTransactions";
import { emissionsFactorItem, tx, txResult } from "../types";

// accessing `emissionsFactors` json
const emissionsFactorsJSON = fs.readFileSync("data/EmissionsFactors.json", {
  encoding: "utf-8",
});
const emissionsFactorsObj: emissionsFactorItem[] =
  JSON.parse(emissionsFactorsJSON);

// global variables
let timestamp = "";
let timestamps: string[] = [];
let emissionsFactor = "";
let emissionsFactors: string[] = [];

// getting an array of the tx timestamps from the address
const getTimestamps = (tx: txResult) => {
  for (let j = 1; j < emissionsFactorsObj.length; j++) {
    if (
      tx.timeStamp < emissionsFactorsObj[j].UnixTimeStamp &&
      tx.timeStamp > emissionsFactorsObj[j - 1].UnixTimeStamp
    ) {
      timestamp = emissionsFactorsObj[j - 1].UnixTimeStamp;
      timestamps.push(timestamp);
    }
  }
  return timestamps;
};

// getting an array of emissions factors from timestamps
const getEmissionsFactors = (timestamp: string) => {
  for (let k = 0; k < emissionsFactorsObj.length; k++) {
    if (emissionsFactorsObj[k].UnixTimeStamp === timestamp) {
      emissionsFactor = emissionsFactorsObj[k].emissionsFactor;
      emissionsFactors.push(emissionsFactor);
    }
  }
  return emissionsFactors;
};

// calculating total address emissions
export const calculateEmissions = async (addr: string) => {
  const transactions: tx = await getTransactions(addr);

  let txEmissions = 0;
  let totalEmissions = 0;

  for (let i = 0; i < transactions.result.length; i++) {
    getTimestamps(transactions.result[i]);
  }

  for (let i = 0; i < timestamps.length; i++) {
    getEmissionsFactors(timestamps[i]);
  }

  for (let i = 0; i < timestamps.length; i++) {
    txEmissions =
      parseFloat(emissionsFactors[i]) *
      parseInt(transactions.result[i].gasUsed);

    totalEmissions += txEmissions;
  }
  const totalEmissionsKg = totalEmissions / 1000;
  return totalEmissionsKg;
};

const emissions = await calculateEmissions(
  "0x619353127678b95C023530df08BCB638870cFDdA"
);
console.log("emissions:", emissions);

// 0x619353127678b95C023530df08BCB638870cFDdA -> mine
// 0xF417ACe7b13c0ef4fcb5548390a450A4B75D3eB3 -> woj.eth
// 0x6B3595068778DD592e39A122f4f5a5cF09C90fE2 -> sushi
