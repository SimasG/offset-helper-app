import { NextApiRequest, NextApiResponse } from "next";
import Papa from "papaparse";

/* Hitting this endpoint processes `GasUsed.csv` & `Hashrate.csv` 
and generates `emissionsFactors.json`
**/
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    // importing CSV locally from http://localhost:3000/..
    const [gasUsedCSV, hashrateCSV] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/GasUsed.csv`),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/Hashrate.csv`),
    ]);

    // processing CSVs into `emissionsFactor.json`
    const gasUsedJSON = Papa.parse();
    // papaparse
    // let gasUsedJSON;
    // let hashrateJSON;

    res.status(200).json({ name: "John Doe" });
  } else {
    res.status(405).end("Method not allowed");
  }
}

export default handler;
