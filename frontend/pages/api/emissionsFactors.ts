import { NextApiRequest, NextApiResponse } from "next";
import Papa from "papaparse";
import { calculateEmissionsFactor } from "../../utils/calculator/calculateEmissionsFactor";
import { emissionsFactorItem } from "../../utils/types";

/* Hitting this endpoint processes `GasUsed.csv` & `Hashrate.csv` 
and generates `emissionsFactors.json`
**/
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // importing CSV locally from http://localhost:3000/..
    const [gasUsedCSV, hashrateCSV] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/GasUsed.csv`).then((res) =>
        res.text()
      ),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/Hashrate.csv`).then((res) =>
        res.text()
      ),
    ]);

    // processing CSVs into `emissionsFactor.json`
    const gasUsedJSON = Papa.parse(gasUsedCSV, {}).data as string[][];
    const hashrateJSON = Papa.parse(hashrateCSV, {}).data as string[][];

    let arr: emissionsFactorItem[] = [];

    // creating daily entries of emissionsFactors
    for (let i = 1; i < gasUsedJSON.length; i++) {
      // if gasUsed is 0, emissionsFactor is also 0
      const emissionsFactor =
        parseInt(gasUsedJSON[i][2]) == 0
          ? 0
          : calculateEmissionsFactor(
              parseInt(gasUsedJSON[i][2]),
              parseInt(hashrateJSON[i][2])
            );

      let obj: emissionsFactorItem = {
        "Date(UTC)": gasUsedJSON[i][0],
        UnixTimeStamp: gasUsedJSON[i][0],
        emissionsFactor: emissionsFactor.toString(),
      };

      arr.push(obj);
    }

    res.status(200).json(arr);
  } else {
    res.status(405).end("Method not allowed");
  }
}

export default handler;
