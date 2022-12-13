import { useAccount } from "wagmi";
import addresses, { OHPolygonAddress } from "../constants/constants";
import { OffsetHelperABI } from "../constants";
import { ethers, FixedNumber } from "ethers"; // ** How am I using ethers without having it installed in my frontend here?

import { Select, NumberInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import handleEstimate from "../utils/getEstimates";

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
  const [estimate, setEstimate] = useState<string>("");

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
      amountToOffset: 0,
    },

    validateInputOnChange: true,

    validate: {
      paymentMethod: (value) => (value === "" ? `Required` : null),
      carbonToken: (value) => (value === "" ? `Required` : null),
      offsetMethod: (value) => (value === "" ? `Required` : null),
      amountToOffset: (value) => (value <= 0 || !value ? `Required` : null),
    },
  });

  const { isConnected } = useAccount();

  useEffect(() => {
    const runHandleEstimate = async () => {
      if (
        form.values.paymentMethod &&
        form.values.carbonToken &&
        form.values.amountToOffset &&
        form.values.offsetMethod
      ) {
        setEstimate(
          await handleEstimate(
            form.values.paymentMethod,
            form.values.carbonToken,
            form.values.amountToOffset,
            form.values.offsetMethod
          )
        );
      } else {
        setEstimate("");
      }
      // console.log("estimate:", estimate);
    };
    runHandleEstimate();
  }, [form.values]);

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

    if (!paymentMethod) {
      setOffsetMethods([
        {
          label: `Specify ${carbonToken.toUpperCase()}`,
          value: carbonToken,
        },
      ]);
    } else {
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
    }
  };

  const handleOffsetMethod = (offsetMethod: string) => {
    if (offsetMethod === "bct" || offsetMethod === "nct") {
      form.setValues({
        carbonToken: offsetMethod,
        offsetMethod: offsetMethod,
      });
    } else {
      form.setValues({
        offsetMethod: offsetMethod,
      });

      setCarbonTokens([
        { label: "BCT", value: "bct" },
        { label: "NCT", value: "nct" },
      ]);
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
        // * Works. Why?
        console.log("trigger autoOffsetExactInETH()");
        autoOffsetExactInETH(offsetMethod, amountToOffset);
      }
    } else {
      if (offsetMethod === "bct" || offsetMethod === "nct") {
        // * Doesn't work
        console.log("trigger autoOffsetExactOutToken()");
        autoOffsetExactOutToken(paymentMethod, offsetMethod, amountToOffset);
      } else {
        console.log("trigger autoOffsetExactInToken()");
        // * Doesn't work
        autoOffsetExactInToken(paymentMethod, offsetMethod, amountToOffset);
      }
    }
  };

  // ** `UNPREDICTABLE_GAS_LIMIT` if amountToOffset is > 0
  // `UniswapV2Library: INSUFFICIENT_OUTPUT_AMOUNT` if amountToOffset is 0. Oke, I just can't have an input of 0, makes sense.
  const autoOffsetExactOutToken = async (
    paymentMethod: string,
    offsetMethod: string,
    amountToOffset: number
  ) => {
    const { ethereum } = window;
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, signer);

    const depositedToken =
      paymentMethod === "wmatic"
        ? addresses.wmatic
        : paymentMethod === "usdc"
        ? addresses.usdc
        : paymentMethod === "weth"
        ? addresses.weth
        : null;

    const poolToken = offsetMethod === "bct" ? addresses.bct : addresses.nct;

    const offsetTx = await oh.autoOffsetExactOutToken(
      depositedToken,
      poolToken,
      FixedNumber.from(amountToOffset.toString())
    );
    await offsetTx.wait();
    console.log("offset hash", offsetTx.hash);
  };

  // ** `UniswapV2Router: EXCESSIVE_INPUT_AMOUNT` if amountToOffset is > 0.
  //  `UniswapV2Library: INSUFFICIENT_OUTPUT_AMOUNT` if amountToOffset is 0. Oke, I just can't have an input of 0, makes sense.
  // Oke, now metamask tx is initiated but it says I'll need to pay 0 MATIC + gas. Doesn't make sense.
  const autoOffsetExactOutETH = async (
    offsetMethod: string,
    amountToOffset: number
  ) => {
    const { ethereum } = window;
    console.log("ethereum:", ethereum);

    // This seems to be a more specific provider, built on "jsonRpc provider"
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(ethereum);
    console.log("provider:", provider);

    const signer = provider.getSigner();
    console.log("signer:", signer);

    const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, signer);
    console.log("Offset Helper contract instance:", oh);

    const poolToken = offsetMethod === "bct" ? addresses.bct : addresses.nct;

    const offsetTx = await oh.autoOffsetExactOutETH(
      poolToken,
      ethers.utils.parseUnits(amountToOffset.toString(), "ether")
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
      value: ethers.utils.parseUnits(amountToOffset.toString(), "ether"),
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

  const handleSubmit = async (values: typeof form.values) => {
    if (isConnected) {
      {
        // offset(values.paymentMethod, values.offsetMethod, values.amountToOffset);
        // toast.success(
        //   `${
        //     form.values.amountToOffset
        //   } ${form.values.paymentMethod.toUpperCase()} has been offset!`
        // );
      }
    } else {
      toast.error("Connect to a Wallet first!");
    }
  };

  const handleError = (errors: typeof form.errors) => {
    if (errors.paymentMethod) {
      showNotification({ message: "Required input", color: "red" });
    }
    if (errors.carbonToken) {
      showNotification({ message: "Required input", color: "red" });
    }
    if (errors.offsetMethod) {
      showNotification({ message: "Required input", color: "red" });
    }
    if (errors.amountToOffset) {
      showNotification({ message: "Required input", color: "red" });
    }
  };

  return (
    <>
      <form
        onSubmit={form.onSubmit(handleSubmit, handleError)}
        className="px-14 py-7 sm:px-20 sm:py-10 bg-white rounded-lg shadow-lg drop-shadow-md shadow-[#d4eed4]"
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
            className="text-5xl"
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
            label="Offset Method"
            placeholder="Select an option"
            {...form.getInputProps("offsetMethod")}
            data={offsetMethods}
            value={form.values.offsetMethod}
            onChange={(e: string) => {
              handleOffsetMethod(e);
            }}
          />

          {/* Amount to Offset */}
          <NumberInput
            label={`Amount of ${form.values.offsetMethod.toUpperCase()} to Offset`}
            {...form.getInputProps("amountToOffset")}
            min={0}
            max={43860}
            precision={2}
            removeTrailingZeros={true}
          />
        </div>

        {form.values.offsetMethod && form.values.paymentMethod && (
          <>
            {(form.values.paymentMethod === "bct" &&
              form.values.offsetMethod === "bct") ||
            (form.values.paymentMethod === "nct" &&
              form.values.offsetMethod === "nct") ? null : (
              <>
                {form.values.carbonToken !== "" &&
                form.values.amountToOffset !== 0 &&
                form.values.amountToOffset !== undefined ? (
                  (form.values.paymentMethod === "matic" ||
                    form.values.paymentMethod === "wmatic" ||
                    form.values.paymentMethod === "usdc" ||
                    form.values.paymentMethod === "weth") &&
                  (form.values.offsetMethod === "bct" ||
                    form.values.offsetMethod === "nct") ? (
                    <p className="text-[14px] text-gray-400 pt-1">
                      Estimated cost: {estimate}{" "}
                      {form.values.paymentMethod.toUpperCase()}
                    </p>
                  ) : (
                    <p className="text-[14px] text-gray-400 pt-1">
                      Equivalent to offsetting {estimate}{" "}
                      {form.values.carbonToken.toUpperCase()}
                    </p>
                  )
                ) : null}
              </>
            )}
          </>
        )}

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
