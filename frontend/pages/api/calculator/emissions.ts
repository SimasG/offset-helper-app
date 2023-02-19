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

    // fetching address token transfer transactions
    const tokenTxResponse = await fetch(
      `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=999999999&page=1&offset=10000&sort=asc&apikey=${process.env.ETHERSCAN_API_KEY}`
    );

    const tokenTransferTransactions = await tokenTxResponse.json();

    let filteredTokenTransferTransactions = tokenTransferTransactions;

    for (let i = 0; i < tokenTransferTransactions.result.length; i++) {
      for (let j = 0; j < transactions.result.length; j++) {
        if (
          tokenTransferTransactions.result[i].hash ===
          transactions.result[j].hash
        ) {
          filteredTokenTransferTransactions.result.splice(i, 1);
          i--;
        }
      }
    }

    const totalTransactions = transactions.result.concat(
      filteredTokenTransferTransactions.result
    );

    const txEmissions = await calculateEmissions(transactions.result);
    const tokenTxEmissions = await calculateEmissions(
      filteredTokenTransferTransactions.result
    );

    const totalEmissions = txEmissions + tokenTxEmissions;

    res.status(200).json({ emissions: totalEmissions });
  } else {
    res.status(405).end("Method not allowed");
  }
}

export default handler;
