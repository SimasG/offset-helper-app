import { TextInput, Tooltip } from "@mantine/core";
import React, { useState } from "react";
import { BiLeftArrowAlt } from "react-icons/bi";
import { useForm } from "@mantine/form";
import { BlockchainCalculatorProps } from "../../utils/types";
import { AiOutlineInfoCircle } from "react-icons/ai";

const BlockchainCalculator = ({
  setOpenBlockchainCalculator,
  openBlockchainCalculator,
  loading,
  setLoading,
}: BlockchainCalculatorProps) => {
  const [emissions, setEmissions] = useState<number>();

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
      `${process.env.NEXT_PUBLIC_APP_URL}/api/emissions`,
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
    setLoading(false);
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
        <div className="p-8">
          {/* Input Container */}
          <div className="flex flex-col gap-4">
            {/* Amount to Offset */}
            <TextInput
              label={
                <div className="flex justify-between gap-[1px]">
                  <h3 className="text-base">Ethereum Address</h3>
                  <Tooltip label="zdare">
                    <AiOutlineInfoCircle className="w-[10px] h-[10px]" />
                  </Tooltip>
                </div>
              }
              // ** not sure if I need these props here
              {...form.getInputProps("address")}
              disabled={loading}
            />
          </div>
        </div>

        {loading && <div className="px-8">Loading...</div>}

        {emissions && (
          <div className="px-8 pb-4">
            <div>
              Total Emissions: <span>{(emissions / 1000).toFixed(2)}t</span> or{" "}
              <span>{emissions.toFixed(2)}kg</span>
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
