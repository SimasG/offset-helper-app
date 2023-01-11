/*
Fetching array of historical transactions of a given address
**/
export const getTransactions = async (addr: string) => {
  const res = await fetch(
    `https://api.etherscan.io/api?module=account&action=txlist&address=${addr}&startblock=0&endblock=99999999&page=1&offset=10000&sort=asc&apikey=IAQEQUWUR1GGPD1RAFIDPUDNVDNCWUMPBI`
  );
  const data = await res.json();
  return data;
};
