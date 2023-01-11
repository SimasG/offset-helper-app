import Head from "next/head";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Header from "../../components/Header";
import BlockchainCalculator from "../../components/BlockchainCalculator";

// `getServerSideProps` will run on each request to this URL (../calculate)
// export async function getServerSideProps(context: any) {
//   console.log("context.params:", context.params);
//   return {
//     props: {},
//   };
// }

const CalculatePage = () => {
  const [openBlockchainCalculator, setOpenBlockchainCalculator] =
    useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <Head>
        <title>Offset Helper Carbon Footprint Calculator</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Header />
      {/* Hero */}
      <div className="flex flex-col items-center justify-center">
        <h1 className="mt-4 mb-6 text-6xl font-bold text-center text-white drop-shadow-2xl">
          Calculate Your
          <mark className="rounded bg-green-900 mx-4 px-1 py-0.5 text-green-300 leading-[70px]">
            Carbon Footprint
          </mark>
        </h1>
        <p className="mb-8 text-lg text-center text-gray-300 drop-shadow-2xl">
          Easily estimate your emissions. Both on-chain and in real world.
        </p>
        {!openBlockchainCalculator && (
          <div
            onClick={() => {
              setOpenBlockchainCalculator(!openBlockchainCalculator);
            }}
            className="flex flex-col items-center justify-center w-full gap-4 sm:flex-row"
          >
            {/* #21B6A8 */}
            <button className="w-5/6 px-6 py-4 text-xs font-bold text-center text-white uppercase transition-all bg-black rounded-md sm:w-fit drop-shadow-2xl hover:opacity-75">
              Blockchain Footprint
            </button>
            <button className="w-5/6 px-6 py-4 text-xs font-bold text-center text-black uppercase transition-all bg-white rounded-md sm:w-fit drop-shadow-2xl hover:opacity-75">
              Real World Footprint
            </button>
          </div>
        )}
      </div>
      {openBlockchainCalculator && (
        <>
          <BlockchainCalculator
            setOpenBlockchainCalculator={setOpenBlockchainCalculator}
            openBlockchainCalculator={openBlockchainCalculator}
            loading={loading}
            setLoading={setLoading}
          />
        </>
      )}
    </div>
  );
};

export default CalculatePage;
