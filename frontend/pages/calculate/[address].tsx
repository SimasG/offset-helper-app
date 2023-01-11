// `getServerSideProps` will run on each request to this URL

import { calculateEmissions } from "../../utils/calculator/calculateEmissions";
import { txResponse } from "../../utils/types";

// (../calculate/[address]) -> (../calculate?address=0x...123)
// export async function getServerSideProps(context: any) {
//   const { params } = context;
//   const { address } = params;

//   // fetching address transactions
//   const response = await fetch(
//     `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10000&sort=asc&apikey=${process.env.ETHERSCAN_API_KEY}`
//   );
//   const transactions: txResponse = await response.json();

//   return {
//     props: {
//       address: address,
//       transactions: transactions,
//     },
//   };
// }

// @ts-ignore
const Address = ({ address, transactions }) => {
  return (
    <div
    // onClick={() => {
    //   let emissions: any;
    //   const awaitWrapper = async () => {
    //     emissions = await calculateEmissions(address, transactions);
    //     console.log("emissions:", emissions);
    //   };
    //   awaitWrapper();
    // }}
    >
      Address
    </div>
  );
};

export default Address;
