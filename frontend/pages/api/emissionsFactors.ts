import { NextApiRequest, NextApiResponse } from "next";
import Papa from "papaparse";
import { calculateEmissionsFactor } from "../../utils/calculator/calculateEmissionsFactor";
import { emissionsFactorItem } from "../../utils/types";

/* This endpoint processes `GasUsed.csv` & `Hashrate.csv` 
  and generates `emissionsFactors.json` that we'll be
  using to calculate total emissions of an address.
**/
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // importing CSVs locally from http://localhost:3000/..
    const [gasUsedCSV, hashrateCSV] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/GasUsed.csv`).then((res) =>
        res.text()
      ),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/Hashrate.csv`).then((res) =>
        res.text()
      ),
    ]);

    // processing CSVs into `emissionsFactor.json`
    const gasUsedObj = Papa.parse(gasUsedCSV, {}).data as string[][];
    const hashrateObj = Papa.parse(hashrateCSV, {}).data as string[][];

    let arr: emissionsFactorItem[] = [];

    // creating daily entries of emissionsFactors
    for (let i = 1; i < gasUsedObj.length; i++) {
      // if gasUsed is 0, emissionsFactor is also 0
      const emissionsFactor =
        parseInt(gasUsedObj[i][2]) == 0
          ? 0
          : calculateEmissionsFactor(
              parseInt(gasUsedObj[i][2]),
              parseInt(hashrateObj[i][2])
            );

      let obj: emissionsFactorItem = {
        "Date(UTC)": gasUsedObj[i][0],
        UnixTimeStamp: gasUsedObj[i][1],
        emissionsFactor: emissionsFactor.toString(),
      };

      arr.push(obj);
    }

    // caching the response (emissionsFactors.json) for 24 hours
    res.setHeader(
      "Cache-Control",
      "Public, max-age=86400, stale-while-revalidate=60"
    );
    res.status(200).json(arr);
  } else {
    res.status(405).end("Method not allowed");
  }
}

export default handler;
