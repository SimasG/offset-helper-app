import "dotenv/config";

/*
Fetching array of historical transactions of a given address
**/
export const getTransactions = async (addr: string) => {
  const response = await fetch(
    `https://api.etherscan.io/api?module=account&action=txlist&address=${addr}&startblock=0&endblock=99999999&page=1&offset=10000&sort=asc&apikey=${process.env.ETHERSCAN_API_KEY}`
  );
  const data = await response.json();
  return data;
};
