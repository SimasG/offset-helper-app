import Head from "next/head";
import Header from "../components/Header";

const calculate = () => {
  console.log("zdare");
  return (
    <div>
      <Head>
        <title>Offset Helper</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Header />
      {/* Hero */}
      <div className="flex flex-col items-center justify-center">
        <h1 className="mt-4 mb-6 text-6xl font-bold text-center text-white">
          Calculate Your
          <mark className="rounded bg-green-900 mx-4 px-1 py-0.5 text-green-300 leading-[70px]">
            Carbon Footprint
          </mark>
        </h1>
        <p className="mb-6 text-lg text-center text-gray-300">
          Easily estimate your emissions. Both on-chain and in real world.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button className="px-6 py-4 font-bold text-center text-white rounded-md bg-[#21B6A8] drop-shadow-2xl hover:opacity-75 transition-all">
            Blockchain Footprint
          </button>
          <button className="px-6 py-4 font-bold text-center text-[#21B6A8] rounded-md drop-shadow-2xl bg-white hover:opacity-75 transition-all">
            Real World Footprint
          </button>
        </div>
      </div>
    </div>
  );
};

export default calculate;
