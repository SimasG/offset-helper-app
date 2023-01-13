import Head from "next/head";
import { useState } from "react";
import Header from "../components/Header";
import BlockchainCalculator from "../components/form/BlockchainCalculator";
import Footer from "../components/Footer";
import { Tooltip } from "@mantine/core";

const CalculatorPage = () => {
  const [openBlockchainCalculator, setOpenBlockchainCalculator] =
    useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="relative min-h-screen pb-8">
      <Head>
        <title>Offset Helper Carbon Footprint Calculator</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff"></meta>
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
          <div className="flex flex-col items-center justify-center w-full gap-4 sm:flex-row">
            {/* #21B6A8 */}
            <button
              onClick={() => {
                setOpenBlockchainCalculator(!openBlockchainCalculator);
              }}
              className="w-5/6 px-6 py-4 text-xs font-bold text-center text-white uppercase transition-all bg-black rounded-md sm:w-fit drop-shadow-2xl hover:opacity-75"
            >
              Blockchain Footprint
            </button>
            <Tooltip
              label={<div className="text-xs">Work in Progress!👷‍♂️</div>}
              radius="xs"
            >
              <button className="w-5/6 px-6 py-4 text-xs font-bold text-center text-black uppercase transition-all bg-white rounded-md sm:w-fit drop-shadow-2xl hover:opacity-75">
                Real World Footprint
              </button>
            </Tooltip>
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
      <Footer />
    </div>
  );
};

export default CalculatorPage;
