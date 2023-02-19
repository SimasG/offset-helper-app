import { emissionsFactorItem, txResponse, txResult } from "../types";

let emissionsFactorsObj: emissionsFactorItem[] = [];

const fetchEmissionsFactors = () => {
  const asyncWrapper = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/calculator/emissionsFactors`
    );
    emissionsFactorsObj = await res.json();
    return emissionsFactorsObj;
  };
  asyncWrapper();
};

fetchEmissionsFactors();

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
export const calculateEmissions = async (transactions: any) => {
  let txEmissions = 0;
  let totalEmissions = 0;

  for (let i = 0; i < transactions.length; i++) {
    getTimestamps(transactions[i]);
  }

  for (let i = 0; i < timestamps.length; i++) {
    getEmissionsFactors(timestamps[i]);
  }

  for (let i = 0; i < timestamps.length; i++) {
    txEmissions =
      parseFloat(emissionsFactors[i]) * parseInt(transactions[i]?.gasUsed);

    totalEmissions += txEmissions;
  }
  const totalEmissionsKg = totalEmissions / 1000;

  // resetting timestamps & emissionsFactors
  timestamps = [];
  emissionsFactors = [];
  return totalEmissionsKg;
};
