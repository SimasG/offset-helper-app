import Header from "../components/Header";
import Head from "next/head";
import OffsetForm from "../components/form/OffsetForm";
import Footer from "../components/Footer";

export async function getServerSideProps({ query }: any) {
  return {
    props: { query },
  };
}

const Home = ({ query }: any) => {
  const {
    paymentMethodCalc,
    carbonTokenCalc,
    offsetMethodCalc,
    amountToOffsetCalc,
  } = query;
  return (
    <div className="relative min-h-screen">
      <Head>
        <title>Offset Helper</title>
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
        <OffsetForm
          paymentMethodCalc={paymentMethodCalc}
          carbonTokenCalc={carbonTokenCalc}
          offsetMethodCalc={offsetMethodCalc}
          amountToOffsetCalc={amountToOffsetCalc}
        />
      </section>
      <Footer />
    </div>
  );
};

export default Home;
