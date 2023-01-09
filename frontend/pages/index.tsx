import type { NextPage } from "next";
import Header from "../components/Header";
import Head from "next/head";
import Form from "../components/Form";
import Footer from "../components/Footer";
// import { calculateEmissions } from "../utils/calculator/calculateEmissions";

type HomeProps = {
  emissions: number;
};

const Home = ({ emissions }: HomeProps) => {
  return (
    <div>
      <Head>
        <title>Offset Helper</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Header />
      <section className="flex flex-col items-center justify-start w-full h-full gap-20 pb-12 sm:gap-10 sm:flex-row sm:pb-16 md:pb-20">
        <div className="flex flex-col items-center justify-center w-full gap-5 p-5">
          <div className="flex items-center justify-center h-full">
            <div className="max-w-md">
              <span className="block text-6xl">🌱</span>
              <h1 className="mt-4 mb-2 text-6xl font-bold text-white">
                Offset your emissions
              </h1>
              <p className="text-lg text-gray-300">
                Effortlessly retire carbon credits on chain with our{" "}
                <mark className="rounded bg-green-900 px-1 py-0.5 text-green-300">
                  offset helper
                </mark>
              </p>
            </div>
          </div>
        </div>
        <Form />
      </section>
      <Footer />
    </div>
  );
};

export default Home;

// Home.getInitialProps = async () => {
//   const emissions = await calculateEmissions(
//     "0x619353127678b95C023530df08BCB638870cFDdA"
//   );
//   console.log("emissions:", emissions);
//   return { emissions };
// };
