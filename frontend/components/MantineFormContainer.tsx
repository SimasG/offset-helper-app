import * as Yup from "yup";
import { initialValuesProps } from "../lib/types";
import {
  useProvider,
  useAccount,
  useContract,
  usePrepareContractWrite,
  useContractWrite,
} from "wagmi";
import addresses, {
  mumbaiAddresses,
  OHMumbaiAddress,
  OHPolygonAddress,
} from "../constants/constants";
import { OffsetHelperABI } from "../constants";
import { ethers, BigNumber, FixedNumber, Contract } from "ethers"; // ** How am I using ethers without having it installed in my frontend here?
import { parseUnits } from "ethers/lib/utils.js";
import { Select, NumberInput } from "@mantine/core";

import { useForm } from "@mantine/form";
import { FormEvent, useState } from "react";

const MantineFormContainer = () => {
  const [carbonTokens, setCarbonTokens] = useState<
    { label: string; value: string }[]
  >([
    { label: "BCT", value: "bct" },
    { label: "NCT", value: "nct" },
  ]);

  const [offsetMethods, setOffsetMethods] = useState<
    { label: string; value: string }[]
  >([
    { label: "Specify BCT", value: "bct" },
    { label: "Specify NCT", value: "nct" },
    { label: "Specify WMATIC", value: "wmatic" },
    { label: "Specify USDC", value: "usdc" },
    { label: "Specify WETH", value: "weth" },
    { label: "Specify MATIC", value: "matic" },
  ]);

  const paymentMethods: { label: string; value: string }[] = [
    { label: "BCT", value: "bct" },
    { label: "NCT", value: "nct" },
    { label: "WMATIC", value: "wmatic" },
    { label: "USDC", value: "usdc" },
    { label: "WETH", value: "weth" },
    { label: "MATIC", value: "matic" },
  ];

  const form = useForm({
    initialValues: {
      paymentMethod: "",
      carbonToken: "",
      offsetMethod: "",
      amountToOffset: "",
    },

    // ** Validate later
    // validate: {
    // }
  });

  // * Functions

  // 1. Changing carbon token to offset option array according to which payment method was selected
  // E.g. if BCT payment method was selected, pre-select BCT as the carbon token to offset

  // 2. Changing offset method option array according to which payment method was selected
  // E.g. if BCT payment method was selected, pre-select "Specify BCT" as the offset method
  const handlePaymentMethod = (paymentMethod: string) => {
    if (paymentMethod === "bct" || paymentMethod === "nct") {
      form.setValues({
        paymentMethod: paymentMethod,
        carbonToken: paymentMethod,
        offsetMethod: paymentMethod,
      });
      setCarbonTokens([
        { label: paymentMethod.toUpperCase(), value: paymentMethod },
      ]);
      setOffsetMethods([
        {
          label: `Specify ${paymentMethod.toUpperCase()}`,
          value: paymentMethod,
        },
      ]);
    } else {
      form.setValues({
        paymentMethod: paymentMethod,
        offsetMethod: paymentMethod,
        carbonToken: "",
      });
      setCarbonTokens([
        { label: "BCT", value: "bct" },
        { label: "NCT", value: "nct" },
      ]);
      setOffsetMethods([
        { label: "Specify BCT", value: "bct" },
        { label: "Specify NCT", value: "nct" },
        {
          label: `Specify ${paymentMethod.toUpperCase()}`,
          value: paymentMethod,
        },
      ]);
    }
  };

  // Changing offset method option array according to which carbon token & payment method was chosen
  const handleCarbonToken = (paymentMethod: string, carbonToken: string) => {
    form.setValues({
      carbonToken: carbonToken,
      offsetMethod: carbonToken,
    });
    setOffsetMethods([
      {
        label: `Specify ${carbonToken.toUpperCase()}`,
        value: carbonToken,
      },
      {
        label: `Specify ${paymentMethod.toUpperCase()}`,
        value: paymentMethod,
      },
    ]);
  };

  // * Blockchain-related functionality
  // If paymentMethod = BCT/NCT -> autoOffsetPoolToken()
  // If paymentMethod = MATIC & offsetMethod = BCT/NCT -> autoOffsetExactOutETH()
  // If paymentMethod = MATIC & offsetMethod = MATIC -> autoOffsetExactInETH()
  // If paymentMethod = WMATIC/USDC/WETH & offsetMethod = BCT/NCT -> autoOffsetExactOutToken()
  // If paymentMethod = WMATIC/USDC/WETH & offsetMethod = WMATIC/USDC/WETH -> autoOffsetExactInToken()
  const offset = (
    paymentMethod: string,
    offsetMethod: string,
    amountToOffset: number
  ) => {
    if (paymentMethod === "bct" || paymentMethod === "nct") {
      // ** Can't test it out atm
      console.log("trigger autoOffsetPoolToken()");
    } else if (paymentMethod === "matic") {
      if (offsetMethod === "bct" || offsetMethod === "nct") {
        // * Doesn't work
        console.log("trigger autoOffsetExactOutETH()");
        autoOffsetExactOutETH(offsetMethod, amountToOffset);
      } else {
        // * Works
        console.log("trigger autoOffsetExactInETH()");
        autoOffsetExactInETH(offsetMethod, amountToOffset);
      }
    } else if (
      paymentMethod === "wmatic" ||
      paymentMethod === "usdc" ||
      paymentMethod === "weth"
    ) {
      if (offsetMethod === "bct" || offsetMethod === "nct") {
        // * Doesn't work
        console.log("trigger autoOffsetExactOutToken()");
        // autoOffsetExactOutToken(paymentMethod, offsetMethod, amountToOffset);
      } else {
        console.log("trigger autoOffsetExactInToken()");
        // * Doesn't work
        autoOffsetExactInToken(paymentMethod, offsetMethod, amountToOffset);
      }
    }
  };

  // ** `UNPREDICTABLE_GAS_LIMIT` if amountToOffset is > 0
  // `UniswapV2Library: INSUFFICIENT_OUTPUT_AMOUNT` if amountToOffset is 0. Oke, I just can't have an input of 0, makes sense.
  // const autoOffsetExactOutToken = async (
  //   paymentMethod: string,
  //   offsetMethod: string,
  //   amountToOffset: number
  // ) => {
  //   const { ethereum } = window;
  //   // @ts-ignore
  //   const provider = new ethers.providers.Web3Provider(ethereum);
  //   const signer = provider.getSigner();

  //   const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, signer);

  //   const depositedToken =
  //     paymentMethod === "wmatic"
  //       ? addresses.wmatic
  //       : paymentMethod === "usdc"
  //       ? addresses.usdc
  //       : paymentMethod === "weth"
  //       ? addresses.weth
  //       : null;

  //   const poolToken = offsetMethod === "bct" ? addresses.bct : addresses.nct;

  //   const offsetTx = await oh.autoOffsetExactOutToken(
  //     depositedToken,
  //     poolToken,
  //     FixedNumber.from(amountToOffset.toString())
  //   );
  //   await offsetTx.wait();
  //   console.log("offset hash", offsetTx.hash);
  // };

  // ** `UniswapV2Router: EXCESSIVE_INPUT_AMOUNT` if amountToOffset is > 0.
  //  `UniswapV2Library: INSUFFICIENT_OUTPUT_AMOUNT` if amountToOffset is 0. Oke, I just can't have an input of 0, makes sense.
  const autoOffsetExactOutETH = async (
    offsetMethod: string,
    amountToOffset: number
  ) => {
    const { ethereum } = window;
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, signer);

    const poolToken = offsetMethod === "bct" ? addresses.bct : addresses.nct;

    const offsetTx = await oh.autoOffsetExactOutETH(
      poolToken,
      FixedNumber.from(amountToOffset.toString())
    );
    await offsetTx.wait();
    console.log("offset hash", offsetTx.hash);
  };

  const autoOffsetExactInETH = async (
    offsetMethod: string,
    amountToOffset: number
  ) => {
    const { ethereum } = window;
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, signer);

    const poolToken = offsetMethod === "bct" ? addresses.bct : addresses.nct;

    const offsetTx = await oh.autoOffsetExactInETH(poolToken, {
      value: ethers.utils.parseUnits("0.01", "ether"),
    });
    await offsetTx.wait();
    console.log("offset hash", offsetTx.hash);
  };

  // ** `UNPREDICTABLE_GAS_LIMIT` if amountToOffset is >= 0
  const autoOffsetExactInToken = async (
    paymentMethod: string,
    offsetMethod: string,
    amountToOffset: number
  ) => {
    const { ethereum } = window;
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, signer);

    const poolToken = offsetMethod === "bct" ? addresses.bct : addresses.nct;

    const offsetTx = await oh.autoOffsetExactInToken(
      addresses[paymentMethod],
      FixedNumber.from(amountToOffset.toString()),
      poolToken
    );
    await offsetTx.wait();
    console.log("offset hash", offsetTx.hash);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form data:", form.values);
    // offset(values.paymentMethod, values.offsetMethod, values.amountToOffset);
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          form.setValues(form.values);
          onSubmit(e);
        }}
      >
        {/* Input Container */}
        <div className="flex flex-col gap-4">
          {/* Payment Method */}
          <Select
            label="Payment Method"
            placeholder="Select an option"
            {...form.getInputProps("paymentMethod")}
            data={paymentMethods}
            value={form.values.paymentMethod}
            onChange={(e: string) => {
              handlePaymentMethod(e);
            }}
          />

          {/* Carbon Token */}
          <Select
            label="Carbon Token to Offset"
            placeholder="Select an option"
            {...form.getInputProps("carbonToken")}
            data={carbonTokens}
            value={form.values.carbonToken}
            onChange={(e: string) => {
              handleCarbonToken(form.values.paymentMethod, e);
            }}
          />

          {/* Offset Method */}
          <Select
            label="Select Offset Method"
            placeholder="Select an option"
            {...form.getInputProps("offsetMethod")}
            data={offsetMethods}
            value={form.values.offsetMethod}
            onChange={(e: string) => {
              form.setFieldValue("offsetMethod", e);
            }}
          />

          {/* Amount to Offset */}
          <NumberInput
            label={`Select Amount of ${form.values.offsetMethod.toUpperCase()} to Offset`}
            {...form.getInputProps("amountToOffset")}
          />
        </div>

        {/* Offset Button */}
        <div className="mt-8 font-bold text-center">
          <button
            className="px-4 py-2 text-white bg-green-500 rounded-sm hover:bg-green-300 drop-shadow-lg"
            type="submit"
          >
            OFFSET
          </button>
        </div>
      </form>
    </>
  );
};

export default MantineFormContainer;
