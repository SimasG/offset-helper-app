import { erc20ABI, useAccount } from "wagmi";
import { Select, NumberInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import handleEstimate from "../utils/getEstimates";
import { BigNumber, ethers } from "ethers";
import { OffsetHelperABI } from "../constants";
import addresses, { OHPolygonAddress } from "../constants/constants";

const Form = () => {
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
  const [estimate, setEstimate] = useState<BigNumber | undefined>();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      paymentMethod: "",
      carbonToken: "",
      offsetMethod: "",
      // ** Types: How do I specify `amountToOffset`'s types? I want to it be both `number` & `string`
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
            // @ts-ignore
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

  const paymentMethods: { label: string; value: string }[] = [
    { label: "BCT", value: "bct" },
    { label: "NCT", value: "nct" },
    { label: "WMATIC", value: "wmatic" },
    { label: "USDC", value: "usdc" },
    { label: "WETH", value: "weth" },
    { label: "MATIC", value: "matic" },
  ];

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
        { label: "BCT", value: "bct" },
        { label: "NCT", value: "nct" },
      ]);
    }
  };

  /**
   * @description runs the applicable offset function
   * If paymentMethod = BCT/NCT -> autoOffsetPoolToken()
   * If paymentMethod = MATIC & offsetMethod = BCT/NCT -> autoOffsetExactOutETH()
   * If paymentMethod = MATIC & offsetMethod = MATIC -> autoOffsetExactInETH()
   * If paymentMethod = WMATIC/USDC/WETH & offsetMethod = BCT/NCT -> autoOffsetExactOutToken()
   * If paymentMethod = WMATIC/USDC/WETH & offsetMethod = WMATIC/USDC/WETH -> autoOffsetExactInToken()
   * @param paymentMethod payment method selected by user
   * @param offsetMethod offset method selected by user
   * @param amountToOffset amount to offset selected by user
   */
  const handleOffset = async (
    paymentMethod: string,
    offsetMethod: string,
    amountToOffset: number
  ) => {
    if (paymentMethod === "bct" || paymentMethod === "nct") {
      await autoOffsetPoolToken(paymentMethod, amountToOffset);
    } else if (paymentMethod === "matic") {
      if (offsetMethod === "bct" || offsetMethod === "nct") {
        await autoOffsetExactOutETH(offsetMethod, amountToOffset);
      } else {
        await autoOffsetExactInETH(offsetMethod, amountToOffset);
      }
    } else {
      if (offsetMethod === "bct" || offsetMethod === "nct") {
        await autoOffsetExactOutToken(
          paymentMethod,
          offsetMethod,
          amountToOffset
        );
      } else {
        await autoOffsetExactInToken(
          paymentMethod,
          offsetMethod,
          amountToOffset
        );
      }
    }
  };

  /**
   * @description `handleOffset` helper: offsets pool token directly (no swaps are necessary)
   * @param paymentMethod payment method selected by user
   * @param amountToOffset amount to offset selected by user
   */
  const autoOffsetPoolToken = async (
    paymentMethod: string,
    amountToOffset: number
  ) => {
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, signer);

    const poolToken = paymentMethod === "bct" ? addresses.bct : addresses.nct;

    const poolTokenContract = new ethers.Contract(poolToken, erc20ABI, signer);

    await (
      await poolTokenContract.approve(
        OHPolygonAddress,
        ethers.utils.parseEther(amountToOffset.toString())
      )
    ).wait();

    const offsetTx = await oh.autoOffsetPoolToken(
      poolToken,
      ethers.utils.parseEther(amountToOffset.toString())
    );

    await offsetTx.wait();
    console.log("offset hash", offsetTx.hash);
  };

  /**
   * @description `handleOffset` helper: offsets specified amount of pool token using MATIC
   * @param offsetMethod offset method selected by user
   * @param amountToOffset amount to offset selected by user
   */
  const autoOffsetExactOutETH = async (
    offsetMethod: string,
    amountToOffset: number
  ) => {
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, signer);

    const poolToken = offsetMethod === "bct" ? addresses.bct : addresses.nct;

    const offsetTx = await oh.autoOffsetExactOutETH(
      poolToken,
      ethers.utils.parseEther(amountToOffset.toString()),
      {
        value: estimate,
      }
    );
    await offsetTx.wait();
    console.log("offset hash", offsetTx.hash);
  };

  /**
   * @description `handleOffset` helper: offsets pool token using specified amount of MATIC
   * @param offsetMethod offset method selected by user
   * @param amountToOffset amount to offset selected by user
   */
  const autoOffsetExactInETH = async (
    offsetMethod: string,
    amountToOffset: number
  ) => {
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, signer);

    const poolToken = offsetMethod === "bct" ? addresses.bct : addresses.nct;

    // ** Not sure why I don't need to approve the MATIC tx here
    const offsetTx = await oh.autoOffsetExactInETH(poolToken, {
      value: ethers.utils.parseEther(amountToOffset.toString()),
    });

    await offsetTx.wait();
    console.log("offset hash", offsetTx.hash);
  };

  /**
   * @description `handleOffset` helper: offsets specified amount of pool token using WMATIC/USDC/WETH
   * @param paymentMethod payment method selected by user
   * @param offsetMethod offset method selected by user
   * @param amountToOffset amount to offset selected by user
   */
  const autoOffsetExactOutToken = async (
    paymentMethod: string,
    offsetMethod: string,
    amountToOffset: number
  ) => {
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, signer);

    const poolToken = offsetMethod === "bct" ? addresses.bct : addresses.nct;

    const depositedToken = addresses[paymentMethod];

    const depositedTokenContract = new ethers.Contract(
      depositedToken,
      erc20ABI,
      signer
    );

    await (
      await depositedTokenContract.approve(OHPolygonAddress, estimate)
    ).wait();

    const offsetTx = await oh.autoOffsetExactOutToken(
      depositedToken,
      poolToken,
      ethers.utils.parseEther(amountToOffset.toString())
    );
    await offsetTx.wait();
    console.log("offset hash", offsetTx.hash);
  };

  /**
   * @description `handleOffset` helper: offsets pool token using specified amount of WMATIC/USDC/WETH
   * @param paymentMethod payment method selected by user
   * @param offsetMethod offset method selected by user
   * @param amountToOffset amount to offset selected by user
   */
  const autoOffsetExactInToken = async (
    paymentMethod: string,
    offsetMethod: string,
    amountToOffset: number
  ) => {
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, signer);

    const poolToken = offsetMethod === "bct" ? addresses.bct : addresses.nct;

    const depositedToken = addresses[paymentMethod];

    const depositedTokenContract = new ethers.Contract(
      depositedToken,
      erc20ABI,
      signer
    );

    await (
      await depositedTokenContract.approve(OHPolygonAddress, estimate)
    ).wait();

    const offsetTx = await oh.autoOffsetExactInToken(
      depositedToken,
      ethers.utils.parseEther(amountToOffset.toString()),
      poolToken
    );

    await offsetTx.wait();
    console.log("offset hash", offsetTx.hash);
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
          await handleOffset(
            values.paymentMethod,
            values.offsetMethod,
            // @ts-ignore
            values.amountToOffset
          );
          setLoading(false);
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
            max={100000}
            precision={2}
            placeholder={0}
            removeTrailingZeros={true}
          />
        </div>

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
                                  10 ** 6
                                ).toFixed(2)
                              : (
                                  parseInt(estimate.toString()) /
                                  10 ** 18
                                ).toFixed(2)}{" "}
                            {form.values.paymentMethod.toUpperCase()}
                          </>
                        </p>
                      )
                    : estimate && (
                        <p className="text-[14px] text-gray-400 pt-1">
                          <>
                            Equivalent to offsetting{" "}
                            {(parseInt(estimate.toString()) / 10 ** 18).toFixed(
                              2
                            )}{" "}
                            {form.values.carbonToken.toUpperCase()}
                          </>
                        </p>
                      )
                  : null}
              </>
            )}
          </>
        )}
        {form.values.amountToOffset && form.values.amountToOffset >= 50000 && (
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
