import { NextApiResponse, NextApiRequest } from "next";
import { calculateEmissions } from "../../../utils/calculator/calculateEmissions";
import { txResponse } from "../../../utils/types";

/* This endpoint receives a POST request with Ethereum address
and returns the emissions of the address
**/
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { address } = req.body;

    // fetching address normal transactions
    const txResponse = await fetch(
      `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10000&sort=asc&apikey=${process.env.ETHERSCAN_API_KEY}`
    );

    const transactions: txResponse = await txResponse.json();

    const txEmissions = await calculateEmissions(transactions.result);

    res.status(200).json({ emissions: txEmissions });
  } else {
    res.status(405).end("Method not allowed");
  }
}

export default handler;
