import type { NextPage } from "next";
import Header from "../components/Header";
import Head from "next/head";
import Form from "../components/Form";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Offset Helper</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Header />
      <div className="absolute flex flex-col items-center justify-start w-full h-full gap-10 sm:gap-20">
        <div className="flex flex-col items-center justify-center gap-5 p-5">
          <h1 className="text-5xl font-bold text-center drop-shadow-lg">
            Offset Your <span className="text-red-500">Emissions</span> Easily
            🌱
          </h1>
          <p className="text-lg font-bold text-center drop-shadow-lg">
            Effortlessly retire carbon credits on chain with our Offset Helper
          </p>
        </div>
        <Form />
      </div>
    </div>
  );
};

export default Home;
