import { TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import Head from "next/head";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Header from "../components/Header";
import { BiLeftArrowAlt } from "react-icons/bi";

const calculate = () => {
  const [openBlockchainCalculator, setOpenBlockchainCalculator] =
    useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      address: "",
    },
    validate: {
      address: (value) =>
        value && value !== ""
          ? value.slice(0, 2) === "0x"
            ? value.length === 42
              ? null
              : "Address must consist of 42 characters"
            : `Address must start with "0x"`
          : "Required",
    },
  });

  /**
   * @description handles form submission (i.e. submission to offset)
   * @param values form values object
   */
  const handleSubmit = async (values: typeof form.values) => {
    // ** `calculateEmissions` func goes here
    // setLoading(true);
    // try {
    //   if (isConnected) {
    //     {
    //       toast.promise(
    //         handleOffset({
    //           paymentMethod: values.paymentMethod,
    //           offsetMethod: values.offsetMethod,
    //           amountToOffset: values.amountToOffset,
    //           estimate: estimate,
    //         }),
    //         {
    //           loading: "Offsetting...",
    //           success: (tx) => offsetSuccess(tx),
    //           error: (err) => `Error offsetting. Check console for details.`,
    //         },
    //         {
    //           style: {
    //             minWidth: "250px",
    //             maxWidth: "750px",
    //           },
    //           success: {
    //             duration: 10000,
    //             icon: "💚",
    //           },
    //         }
    //       );
    //       setLoading(false);
    //     }
    //   } else {
    //     toast.error("Connect to a Wallet first!");
    //   }
    // } catch {
    //   setLoading(false);
    // }
  };

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
            <button className="w-5/6 sm:w-fit px-6 py-4 font-bold text-center text-white rounded-md bg-[#21B6A8] drop-shadow-2xl hover:opacity-75 transition-all">
              Blockchain Footprint
            </button>
            <button className="w-5/6 sm:w-fit px-6 py-4 font-bold text-center text-[#21B6A8] rounded-md drop-shadow-2xl bg-white hover:opacity-75 transition-all">
              Real World Footprint
            </button>
          </div>
        )}
      </div>
      {openBlockchainCalculator && (
        <>
          <div className="flex flex-col items-center justify-center w-full h-full mt-8">
            <div className="w-5/6 text-gray-300 transition-all rounded cursor-pointer sm:w-3/5 md:w-2/4 lg:w-5/12">
              <BiLeftArrowAlt
                className="w-8 h-8 hover:opacity-75"
                onClick={() =>
                  setOpenBlockchainCalculator(!openBlockchainCalculator)
                }
              />
            </div>
            <form
              onSubmit={form.onSubmit(handleSubmit)}
              className="w-5/6 bg-white rounded sm:w-3/5 md:w-2/4 lg:w-5/12"
            >
              <div className="p-8">
                {/* Input Container */}
                <div className="flex flex-col gap-4">
                  {/* Amount to Offset */}
                  <TextInput
                    label="Address"
                    // ** not sure if I need these props here
                    {...form.getInputProps("address")}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Calculate Button */}
              <div className="font-bold text-center">
                <button
                  disabled={loading}
                  className="w-full py-4 text-sm font-semibold text-white uppercase transition-colors rounded-b font-fire-sans-serif bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:bg-green-300"
                  type="submit"
                >
                  Calculate
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default calculate;
