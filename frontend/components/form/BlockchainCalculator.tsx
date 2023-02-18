import { Loader, TextInput, Tooltip } from "@mantine/core";
import React, { useState } from "react";
import { BiLeftArrowAlt } from "react-icons/bi";
import { useForm } from "@mantine/form";
import { BlockchainCalculatorProps, klimaRetirements } from "../../utils/types";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { useRouter } from "next/router";
import { FETCH_ADDRESS_RETIREMENTS } from "../../queries/index";
import { klimaSubgraphQuery } from "../../utils/klimaSubgraphQuery";

const BlockchainCalculator = ({
  setOpenBlockchainCalculator,
  openBlockchainCalculator,
  loading,
  setLoading,
}: BlockchainCalculatorProps) => {
  const [emissions, setEmissions] = useState<number>();
  const [previouslyRetiredEmissions, setPreviouslyRetiredEmissions] =
    useState<number>();
  const router = useRouter();

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
    setLoading(true);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/calculator/emissions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      }
    );

    const emissions = (await response.json()).emissions;
    setEmissions(emissions);

    const addressRetirements: klimaRetirements = await klimaSubgraphQuery(
      // "Polygon Bridged Carbon" subgraph only accepts lower cased addresses
      FETCH_ADDRESS_RETIREMENTS(values.address.toLowerCase())
    );

    let totalPreviouslyRetiredEmissions = 0;
    addressRetirements.klimaRetires.forEach((retirement) => {
      totalPreviouslyRetiredEmissions += parseFloat(retirement.amount);
    });

    setPreviouslyRetiredEmissions(totalPreviouslyRetiredEmissions);
    setLoading(false);
  };

  const handleOffset = async () => {
    // adding pre-set values in the offset form to offset
    // the given Ethereum address
    router.query.paymentMethodCalc = "usdc";
    router.query.carbonTokenCalc = "nct";
    router.query.offsetMethodCalc = "usdc";
    router.query.amountToOffsetCalc = (emissions! / 1000)?.toString();
    const {
      paymentMethodCalc,
      carbonTokenCalc,
      offsetMethodCalc,
      amountToOffsetCalc,
    } = router.query;
    router.push(
      `/?paymentMethodCalc=${paymentMethodCalc}&carbonTokenCalc=${carbonTokenCalc}&offsetMethodCalc=${offsetMethodCalc}&amountToOffsetCalc=${amountToOffsetCalc}`
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full mt-8">
      <div className="w-5/6 text-gray-300 transition-all rounded cursor-pointer sm:w-3/5 md:w-2/4 lg:w-5/12">
        <BiLeftArrowAlt
          className="w-8 h-8 hover:opacity-75"
          onClick={() => setOpenBlockchainCalculator(!openBlockchainCalculator)}
        />
      </div>
      <form
        onSubmit={form.onSubmit(handleSubmit)}
        className="w-5/6 bg-white rounded sm:w-3/5 md:w-2/4 lg:w-5/12"
      >
        <div className="px-8 pt-8 pb-6">
          {/* Input Container */}
          <div className="flex flex-col gap-4">
            {/* Amount to Offset */}
            <TextInput
              label={
                <div className="flex justify-between gap-[1px]">
                  <h3 className="text-base">Ethereum Address</h3>
                  <Tooltip
                    label={
                      <div className="text-xs">
                        At the moment, only Ethereum addresses are supported.
                      </div>
                    }
                    radius="xs"
                  >
                    <div>
                      <AiOutlineInfoCircle className="w-[10px] h-[10px]" />
                    </div>
                  </Tooltip>
                </div>
              }
              {...form.getInputProps("address")}
              disabled={loading}
            />
          </div>
        </div>

        {loading && (
          <div className="flex justify-center w-full px-8 py-4">
            <Loader />
          </div>
        )}

        {emissions && (
          <div className="px-8 pb-4">
            <div className="pb-4 text-xl italic font-bold">
              Total Carbon Emissions:{" "}
              <mark className="rounded bg-green-900 px-1 py-0.5 text-green-300">
                {(emissions / 1000).toFixed(2)}t
              </mark>{" "}
            </div>
            <div className="pb-4">
              Previously Offset Emissions:{" "}
              <mark className="rounded bg-green-900 px-1 py-0.5 text-green-300">
                {previouslyRetiredEmissions?.toFixed(2)}t
              </mark>{" "}
            </div>
            <div className="flex justify-center pb-6">
              <button className="btn-grad" onClick={() => handleOffset()}>
                Offset Your Emissions 🌱
              </button>
            </div>
            <div className="text-xs text-gray-500">
              The calculator is built using{" "}
              <a
                href="https://kylemcdonald.github.io/ethereum-emissions/"
                className="underline"
              >
                Kyle McDonald's
              </a>{" "}
              Ethereum carbon footprint calculation methodology. Thank you!
            </div>
          </div>
        )}

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
  );
};

export default BlockchainCalculator;
