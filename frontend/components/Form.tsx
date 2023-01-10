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
import {
  carbonTokensProps,
  offsetMethodsProps,
  transactionProps,
} from "../utils/types";
import handleOffset from "../utils/offset";
import Icon from "./Icon";
import { ContractTransaction } from "ethers";

const Form = () => {
  const [carbonTokens, setCarbonTokens] = useState<carbonTokensProps[]>([
    { label: "BCT", value: "bct", image: "/bct.png" },
    { label: "NCT", value: "nct", image: "/nct.png" },
  ]);
  const [offsetMethods, setOffsetMethods] = useState<offsetMethodsProps>([
    { label: "Specify BCT", value: "bct" },
    { label: "Specify NCT", value: "nct" },
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
          await handleEstimate({
            paymentMethod: form.values.paymentMethod,
            carbonToken: form.values.carbonToken,
            amountToOffset: form.values.amountToOffset,
            offsetMethod: form.values.offsetMethod,
          })
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

  const validForm =
    !!form.values.offsetMethod &&
    !!form.values.paymentMethod &&
    formCompleted &&
    !!estimate;

  // Converting BigNumber with 18 decimals to string
  const ETHToString =
    estimate && (parseInt(estimate.toString()) / ETHDenominator).toFixed(2);

  // Converting BigNumber with 6 decimals to string
  const USDCToString =
    estimate && (parseInt(estimate.toString()) / USDCDenominator).toFixed(2);

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

  // ** Should the type be ethers' `ContractTransaction`?
  const offsetSuccess = (tx: transactionProps) => {
    console.log("tx:", tx);
    return (
      <div className="flex flex-col w-full gap-2">
        <div>
          <h3 className="text-xs font-semibold">Transaction Completed</h3>
          <p className="text-[11px]">
            Successfully offset{" "}
            <>
              {estimate &&
                (parseInt(estimate.toString()) / ETHDenominator).toFixed(2)}
            </>{" "}
            {form.values.carbonToken} for {form.values.amountToOffset}{" "}
            {form.values.paymentMethod.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center justify-center h-full">
          <div className="w-full text-center">
            <a
              target="_blank"
              href={`https://polygonscan.com/tx/${tx.hash}`}
              rel="noopener noreferrer"
              className="text-xs text-blue-500"
            >
              Details
            </a>
          </div>
          <div className="w-full text-center">
            <button
              className="text-xs text-blue-500"
              onClick={() => toast.dismiss()}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
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
          toast.promise(
            handleOffset({
              paymentMethod: values.paymentMethod,
              offsetMethod: values.offsetMethod,
              amountToOffset: values.amountToOffset,
              estimate: estimate,
            }),
            {
              loading: "Offsetting... Please wait.",
              success: (tx) => offsetSuccess(tx),
              error: (err) => `Error offsetting. Check console for details.`,
            },
            {
              style: {
                minWidth: "250px",
                maxWidth: "750px",
              },
              success: {
                duration: 10000,
                icon: "💚",
              },
            }
          );
          setLoading(false);
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

  return (
    <>
      <div className="flex items-center justify-center w-full h-full">
        <form
          onSubmit={form.onSubmit(handleSubmit, handleError)}
          className="w-5/6 bg-white rounded-lg sm:w-4/5 lg:w-2/3"
        >
          <div className="p-8">
            {/* Input Container */}
            <div className="flex flex-col gap-4">
              {/* Payment Method */}
              <Select
                label="PAYMENT METHOD"
                {...form.getInputProps("paymentMethod")}
                data={paymentMethods}
                itemComponent={SelectItem}
                icon={
                  form.values.paymentMethod ? (
                    <Icon token={form.values.paymentMethod} />
                  ) : undefined
                }
                rightSection={<></>}
                value={form.values.paymentMethod}
                onChange={(e: string) => {
                  handlePaymentMethod(e);
                }}
                className="text-5xl"
              />

              {/* Carbon Token */}
              <Select
                label="CARBON TOKEN TO OFFSET"
                {...form.getInputProps("carbonToken")}
                data={carbonTokens}
                itemComponent={SelectItem}
                icon={
                  form.values.carbonToken ? (
                    <Icon token={form.values.carbonToken} />
                  ) : undefined
                }
                rightSection={<></>}
                value={form.values.carbonToken}
                onChange={(e: string) => {
                  handleCarbonToken(form.values.paymentMethod, e);
                }}
              />

              {/* Offset Method */}
              <Select
                label="OFFSET METHOD"
                {...form.getInputProps("offsetMethod")}
                data={offsetMethods}
                rightSection={<></>}
                value={form.values.offsetMethod}
                onChange={(e: string) => {
                  handleOffsetMethod(e);
                }}
              />

              {/* Amount to Offset */}
              <NumberInput
                label={`${form.values.offsetMethod.toUpperCase()} AMOUNT TO OFFSET`}
                {...form.getInputProps("amountToOffset")}
                min={0}
                max={100000}
                precision={3}
                placeholder={0}
                removeTrailingZeros={true}
              />
            </div>

            {/* Estimates */}
            {validForm && !paymentMethodPoolToken && (
              <>
                {paymentMethodNotPoolTokenOffsetMethodPoolToken ? (
                  <p className="text-[12px] text-gray-400 pt-1">
                    <>
                      Estimated cost:{" "}
                      {form.values.paymentMethod === "usdc"
                        ? USDCToString
                        : ETHToString}{" "}
                      {form.values.paymentMethod.toUpperCase()}
                    </>
                  </p>
                ) : (
                  <p className="text-[12px] text-gray-400 pt-1">
                    <>
                      Equivalent to offsetting {ETHToString}{" "}
                      {form.values.carbonToken.toUpperCase()}
                    </>
                  </p>
                )}
              </>
            )}

            {/* Large input warning */}
            {validForm && !paymentMethodPoolToken && (
              <>
                {form.values.paymentMethod === "weth" ? (
                  <>
                    {form.values.amountToOffset! >= 40 && (
                      <p className="text-[12px] text-[#FA5252] pt-1 w-[200px]">
                        Note: large inputs significantly deteriorate exchange
                        rate
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    {form.values.amountToOffset! >= 40000 && (
                      <p className="text-[12px] text-[#FA5252] pt-1">
                        Note: large inputs significantly deteriorate exchange
                        rate
                      </p>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Offset Button */}
          <div className="font-bold text-center">
            <button
              disabled={loading}
              className="w-full py-4 text-sm font-semibold text-white uppercase transition-colors rounded-b font-fire-sans-serif bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:bg-green-300"
              type="submit"
            >
              Offset
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Form;
