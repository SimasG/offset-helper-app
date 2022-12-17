import { useAccount } from "wagmi";
import { Select, NumberInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import handleEstimate from "../utils/getEstimates";
import { BigNumber } from "ethers";
import { ETHDenominator, USDCDenominator } from "../constants/constants";
import SelectItem from "./SelectItem";
import { paymentMethods } from "../utils/paymentMethods";
import { carbonTokensProps, offsetMethodsProps } from "../utils/types";
import Test from "./Test";
import handleOffset from "../utils/offset";

const Form = () => {
  const [carbonTokens, setCarbonTokens] = useState<carbonTokensProps>([
    { label: "BCT", value: "bct", image: "/bct.png" },
    { label: "NCT", value: "nct", image: "/nct.png" },
  ]);
  const [offsetMethods, setOffsetMethods] = useState<offsetMethodsProps>([
    { label: "Specify BCT", value: "bct" },
    { label: "Specify NCT", value: "nct" },
    { label: "Specify WMATIC", value: "wmatic" },
    { label: "Specify USDC", value: "usdc" },
    { label: "Specify WETH", value: "weth" },
    { label: "Specify MATIC", value: "matic" },
  ]);
  const [estimate, setEstimate] = useState<BigNumber | undefined>();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      paymentMethod: "",
      carbonToken: "",
      offsetMethod: "",
      amountToOffset: undefined,
    },

    validateInputOnChange: true,

    validate: {
      paymentMethod: (value) => (value === "" ? `Required` : null),
      carbonToken: (value) => (value === "" ? `Required` : null),
      offsetMethod: (value) => (value === "" ? `Required` : null),
      amountToOffset: (value) =>
        typeof value === "number"
          ? value <= 0
            ? `Value must be above 0`
            : null
          : `Required`,
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
        setEstimate(undefined);
      }
    };
    runHandleEstimate();
  }, [form.values]);

  // Ternary conditions
  const paymentMethodNotPoolTokenOffsetMethodPoolToken =
    (form.values.paymentMethod === "matic" ||
      form.values.paymentMethod === "wmatic" ||
      form.values.paymentMethod === "usdc" ||
      form.values.paymentMethod === "weth") &&
    (form.values.offsetMethod === "bct" || form.values.offsetMethod === "nct");

  const formCompleted =
    form.values.carbonToken !== "" &&
    (form.values.amountToOffset !== 0 || form.values.amountToOffset !== "") &&
    form.values.amountToOffset !== undefined;

  const paymentMethodPoolToken =
    form.values.paymentMethod === "bct" || form.values.paymentMethod === "nct";

  /**
   * @description sets form values & updates `carbonTokens` and `offsetMethods` arrays according to selected payment method
   * @param paymentMethod payment method selected by user
   */
  const handlePaymentMethod = (paymentMethod: string) => {
    if (paymentMethod === "bct" || paymentMethod === "nct") {
      form.setValues({
        paymentMethod: paymentMethod,
        carbonToken: paymentMethod,
        offsetMethod: paymentMethod,
      });
      setCarbonTokens([
        {
          label: paymentMethod.toUpperCase(),
          value: paymentMethod,
          image: `/${paymentMethod}.png`,
        },
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
        { label: "BCT", value: "bct", image: "/bct.png" },
        { label: "NCT", value: "nct", image: "/nct.png" },
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

  /**
   * @description sets form values & updates `offsetMethods` array according to selected carbon token and payment method
   * @param paymentMethod payment method selected by user
   * @param carbonToken carbon token selected by user
   */
  const handleCarbonToken = (paymentMethod: string, carbonToken: string) => {
    form.setValues({
      carbonToken: carbonToken,
      offsetMethod: carbonToken,
    });

    if (!paymentMethod || paymentMethod === "bct" || paymentMethod === "nct") {
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

  /**
   * @description sets form values & updates `carbonTokens` array according to selected offset method
   * @param offsetMethod offset method selected by user
   */
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
        { label: "BCT", value: "bct", image: "/bct.png" },
        { label: "NCT", value: "nct", image: "/nct.png" },
      ]);
    }
  };

  /**
   * @description handles form submission (i.e. submission to offset)
   * @param values form values object
   */
  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      if (isConnected) {
        {
          const offsetTx = await handleOffset({
            paymentMethod: values.paymentMethod,
            offsetMethod: values.offsetMethod,
            amountToOffset: values.amountToOffset,
            estimate: estimate,
          });
          setLoading(false);
          console.log("offsetTx:", offsetTx);
          if (offsetTx === undefined) return;
          toast.success(
            `${
              form.values.amountToOffset
            } ${form.values.paymentMethod.toUpperCase()} has been offset!`
          );
        }
      } else {
        toast.error("Connect to a Wallet first!");
      }
    } catch {
      setLoading(false);
    }
  };

  /**
   * @description handles form validation error display
   * @param errors form errors object
   */
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

  // const state1 = !!form.values.offsetMethod && !!form.values.paymentMethod && !paymentMethodPoolToken && formCompleted && !!estimate;

  return (
    <>
      <form
        onSubmit={form.onSubmit(handleSubmit, handleError)}
        className="px-8 py-4 sm:px-20 sm:py-10 bg-white rounded-lg shadow-sm drop-shadow-md shadow-[#d4eed4]"
      >
        {/* Input Container */}
        <div className="flex flex-col gap-4">
          {/* Payment Method */}
          <Select
            label="Payment Method"
            placeholder="Select an option"
            {...form.getInputProps("paymentMethod")}
            data={paymentMethods}
            itemComponent={SelectItem}
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
            itemComponent={SelectItem}
            icon={form.values.carbonToken ? <Test /> : undefined}
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
            max={100000}
            precision={3}
            placeholder={0}
            removeTrailingZeros={true}
          />
        </div>

        {/* 
            {
              state1 && (
                <>
                {
                  paymentMethodNotPoolTokenOffsetMethodPoolToken ? () : ()
                }
                </>
              )
            } */}

        {/* Estimates */}
        {form.values.offsetMethod && form.values.paymentMethod && (
          <>
            {paymentMethodPoolToken ? null : (
              <>
                {formCompleted
                  ? paymentMethodNotPoolTokenOffsetMethodPoolToken
                    ? estimate && (
                        <p className="text-[14px] text-gray-400 pt-1">
                          <>
                            Estimated cost:{" "}
                            {form.values.paymentMethod === "usdc"
                              ? (
                                  parseInt(estimate.toString()) /
                                  USDCDenominator
                                ).toFixed(2)
                              : (
                                  parseInt(estimate.toString()) / ETHDenominator
                                ).toFixed(2)}{" "}
                            {form.values.paymentMethod.toUpperCase()}
                          </>
                        </p>
                      )
                    : estimate && (
                        <p className="text-[14px] text-gray-400 pt-1">
                          <>
                            Equivalent to offsetting{" "}
                            {(
                              parseInt(estimate.toString()) / ETHDenominator
                            ).toFixed(2)}{" "}
                            {form.values.carbonToken.toUpperCase()}
                          </>
                        </p>
                      )
                  : null}
              </>
            )}
          </>
        )}
        {formCompleted &&
          !paymentMethodPoolToken &&
          form.values.amountToOffset &&
          form.values.amountToOffset >= 50000 && (
            <p className="text-[14px] text-[#FA5252] pt-1 w-[200px]">
              Note: large inputs significantly deteriorate exchange rate
            </p>
          )}

        {/* Offset Button */}
        <div className="mt-8 font-bold text-center">
          <button
            disabled={loading}
            className="px-4 py-2 text-white bg-green-500 rounded-sm hover:bg-green-300 drop-shadow-lg disabled:opacity-50 disabled:bg-green-300"
            type="submit"
          >
            OFFSET
          </button>
        </div>
      </form>
    </>
  );
};

export default Form;
