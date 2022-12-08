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
import { FormEvent } from "react";

const MantineFormContainer = () => {
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

  // * Select options
  const paymentMethods: { key: string; value: string }[] = [
    { key: "Select an option", value: "" },
    { key: "BCT", value: "bct" },
    { key: "NCT", value: "nct" },
    { key: "WMATIC", value: "wmatic" },
    { key: "USDC", value: "usdc" },
    { key: "WETH", value: "weth" },
    { key: "MATIC", value: "matic" },
  ];

  let carbonTokens: { key: string; value: string }[] = [
    { key: "Select an option", value: "" },
    { key: "BCT", value: "bct" },
    { key: "NCT", value: "nct" },
  ];

  let offsetMethods: { key: string; value: string }[] = [
    { key: "Select an option", value: "" },
    { key: "Specify BCT", value: "bct" },
    { key: "Specify NCT", value: "nct" },
    { key: "Specify WMATIC", value: "wmatic" },
    { key: "Specify USDC", value: "usdc" },
    { key: "Specify WETH", value: "weth" },
    { key: "Specify MATIC", value: "matic" },
  ];

  // * Functions

  // 1. Changing carbon token to offset option array according to which payment method was selected
  // E.g. if BCT payment method was selected, pre-select BCT as the carbon token to offset

  // 2. Changing offset method option array according to which payment method was selected
  // E.g. if BCT payment method was selected, pre-select "Specify BCT" as the offset method
  const changeOptionsPaymentMethod = (paymentMethod: string) => {
    if (paymentMethod === "bct") {
      carbonTokens = [{ key: "BCT", value: "bct" }];
      offsetMethods = [{ key: "Specify BCT", value: "bct" }];
    }
    if (paymentMethod === "nct") {
      carbonTokens = [{ key: "NCT", value: "nct" }];
      offsetMethods = [{ key: "Specify NCT", value: "nct" }];
    }
    if (paymentMethod === "wmatic") {
      carbonTokens = [
        { key: "Select an option", value: "" },
        { key: "BCT", value: "bct" },
        { key: "NCT", value: "nct" },
      ];
      offsetMethods = [
        { key: "Select an option", value: "" },
        { key: "Specify BCT", value: "bct" },
        { key: "Specify NCT", value: "nct" },
        { key: "Specify WMATIC", value: "wmatic" },
      ];
    }
    if (paymentMethod === "usdc") {
      carbonTokens = [
        { key: "Select an option", value: "" },
        { key: "BCT", value: "bct" },
        { key: "NCT", value: "nct" },
      ];
      offsetMethods = [
        { key: "Select an option", value: "" },
        { key: "Specify BCT", value: "bct" },
        { key: "Specify NCT", value: "nct" },
        { key: "Specify USDC", value: "usdc" },
      ];
    }
    if (paymentMethod === "matic") {
      carbonTokens = [
        { key: "Select an option", value: "" },
        { key: "BCT", value: "bct" },
        { key: "NCT", value: "nct" },
      ];
      offsetMethods = [
        { key: "Select an option", value: "" },
        { key: "Specify BCT", value: "bct" },
        { key: "Specify NCT", value: "nct" },
        { key: "Specify MATIC", value: "matic" },
      ];
    }
    if (paymentMethod === "") {
      carbonTokens = [
        { key: "Select an option", value: "" },
        { key: "BCT", value: "bct" },
        { key: "NCT", value: "nct" },
      ];
      offsetMethods = [
        { key: "Select an option", value: "" },
        { key: "Specify BCT", value: "bct" },
        { key: "Specify NCT", value: "nct" },
        { key: "Specify WMATIC", value: "wmatic" },
        { key: "Specify USDC", value: "usdc" },
        { key: "Specify WETH", value: "weth" },
        { key: "Specify MATIC", value: "matic" },
      ];
    }
  };

  // Changing offset method option array according to which carbon token & payment method was chosen
  const changeOptionsCarbonToken = (
    carbonToken: string,
    paymentMethod: string
  ) => {
    if (paymentMethod === "wmatic") {
      if (carbonToken === "bct") {
        carbonTokens = [
          { key: "BCT", value: "bct" },
          { key: "NCT", value: "nct" },
        ];
        offsetMethods = [
          { key: "Specify BCT", value: "bct" },
          { key: "Specify WMATIC", value: "wmatic" },
        ];
      }
      if (carbonToken === "nct") {
        carbonTokens = [
          { key: "BCT", value: "bct" },
          { key: "NCT", value: "nct" },
        ];
        offsetMethods = [
          { key: "Specify NCT", value: "nct" },
          { key: "Specify WMATIC", value: "wmatic" },
        ];
      }
    }
    if (paymentMethod === "usdc") {
      if (carbonToken === "bct") {
        carbonTokens = [
          { key: "BCT", value: "bct" },
          { key: "NCT", value: "nct" },
        ];
        offsetMethods = [
          { key: "Specify BCT", value: "bct" },
          { key: "Specify USDC", value: "usdc" },
        ];
      }
      if (carbonToken === "nct") {
        carbonTokens = [
          { key: "BCT", value: "bct" },
          { key: "NCT", value: "nct" },
        ];
        offsetMethods = [
          { key: "Specify NCT", value: "nct" },
          { key: "Specify USDC", value: "usdc" },
        ];
      }
    }
    if (paymentMethod === "weth") {
      if (carbonToken === "bct") {
        carbonTokens = [
          { key: "BCT", value: "bct" },
          { key: "NCT", value: "nct" },
        ];
        offsetMethods = [
          { key: "Specify BCT", value: "bct" },
          { key: "Specify WETH", value: "weth" },
        ];
      }
      if (carbonToken === "nct") {
        carbonTokens = [
          { key: "BCT", value: "bct" },
          { key: "NCT", value: "nct" },
        ];
        offsetMethods = [
          { key: "Specify NCT", value: "nct" },
          { key: "Specify WETH", value: "weth" },
        ];
      }
    }
    if (paymentMethod === "matic") {
      if (carbonToken === "bct") {
        carbonTokens = [
          { key: "BCT", value: "bct" },
          { key: "NCT", value: "nct" },
        ];
        offsetMethods = [
          { key: "Specify BCT", value: "bct" },
          { key: "Specify MATIC", value: "matic" },
        ];
      }
      if (carbonToken === "nct") {
        carbonTokens = [
          { key: "BCT", value: "bct" },
          { key: "NCT", value: "nct" },
        ];
        offsetMethods = [
          { key: "Specify NCT", value: "nct" },
          { key: "Specify MATIC", value: "matic" },
        ];
      }
    }
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
      <form onSubmit={(e) => onSubmit(e)}>
        {/* Payment Method */}
        <Select
          label="Payment Method"
          {...form.getInputProps("paymentMethod")}
          data={[
            { label: "BCT", value: "bct" },
            { label: "NCT", value: "nct" },
            { label: "WMATIC", value: "wmatic" },
            { label: "USDC", value: "usdc" },
            { label: "WETH", value: "weth" },
            { label: "MATIC", value: "matic" },
          ]}
        />

        {/* Carbon Token */}
        <Select
          label="Carbon Token to Offset"
          {...form.getInputProps("carbonToken")}
          data={[
            { label: "Select an option", value: "" },
            { label: "BCT", value: "bct" },
            { label: "NCT", value: "nct" },
          ]}
        />

        {/* Offset Method */}
        <Select
          label="Select Offset Method"
          {...form.getInputProps("offsetMethod")}
          data={[
            { label: "Select an option", value: "" },
            { label: "Specify BCT", value: "bct" },
            { label: "Specify NCT", value: "nct" },
            { label: "Specify WMATIC", value: "wmatic" },
            { label: "Specify USDC", value: "usdc" },
            { label: "Specify WETH", value: "weth" },
            { label: "Specify MATIC", value: "matic" },
          ]}
        />

        {/* Amount to Offset */}
        <NumberInput
          label="Select Amount of TOKEN to Offset"
          {...form.getInputProps("amountToOffset")}
        />

        {/* Offset Button */}
        <div className="mt-4 font-bold text-center">
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
