import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { initialValuesProps } from "../../lib/types";
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
} from "../../constants/constants";
import { OffsetHelperABI } from "../../constants";
import { ethers, BigNumber, FixedNumber, Contract } from "ethers"; // ** How am I using ethers without having it installed in my frontend here?
import { parseUnits } from "ethers/lib/utils.js";
import { Select } from "@mantine/core";
import SelectComponent from "./SelectComponent";

const FormikContainer = () => {
  const initialValues: initialValuesProps = {
    paymentMethod: "",
    carbonToken: "",
    offsetMethod: "",
    amountToOffset: "",
  };
  const validationSchema = Yup.object({
    paymentMethod: Yup.string().required("Required"),
    carbonToken: Yup.string().required("Required"),
    offsetMethod: Yup.string().required("Required"),
    amountToOffset: Yup.number().required("Required"),
  });
  const onSubmit = async (values: any) => {
    console.log("Form data:", values);
    offset(values.paymentMethod, values.offsetMethod, values.amountToOffset);
  };

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

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {(formik) => {
        const { values, setFieldValue } = formik;
        return (
<<<<<<< HEAD
          <Form>
            {/* Test Select */}
            <div className="flex flex-col justify-between gap-2">
              <label
                className="text-sm font-bold text-fontPrimary dark:text-fontPrimaryDark"
                htmlFor="paymentMethod"
              >
                Test Label
              </label>
              <Field
                as={SelectComponent}
                id="paymentMethod"
                name="paymentMethod"
              >
                {paymentMethods?.map(
                  (paymentMethod: { key: string; value: string }) => {
                    return (
                      <option
                        key={paymentMethod.value}
                        value={paymentMethod.value}
                      >
                        {paymentMethod.key}
                      </option>
                    );
                  }
                )}
              </Field>
              <ErrorMessage
                name="paymentMethod"
                component="p"
                className="font-medium text-red-400"
              />
            </div>

            {/* Payment Method Manual Select */}
            <div className="flex flex-col justify-between gap-2">
              <label
                className="text-sm font-bold text-fontPrimary dark:text-fontPrimaryDark"
                htmlFor="paymentMethod"
              >
                Payment Method
              </label>
              <Field
                as="select"
                id="paymentMethod"
                name="paymentMethod"
                value={values.paymentMethod}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  // Changing subsequent select options depending on which payment method is chosen
                  changeOptionsPaymentMethod(e.target.value);
                  setFieldValue("paymentMethod", e.target.value);
                  setFieldValue("carbonToken", e.target.value);
                  setFieldValue("offsetMethod", e.target.value);
                }}
              >
                {paymentMethods?.map(
                  (paymentMethod: { key: string; value: string }) => {
                    return (
                      <option
                        key={paymentMethod.value}
                        value={paymentMethod.value}
                      >
                        {paymentMethod.key}
                      </option>
                    );
                  }
                )}
              </Field>
              <ErrorMessage
                name="paymentMethod"
                component="p"
                className="font-medium text-red-400"
              />
            </div>
            {/* Carbon Token Manual Select */}
            <div className="flex flex-col justify-between gap-2">
              <label
                className="text-sm font-bold text-fontPrimary dark:text-fontPrimaryDark"
                htmlFor="carbonToken"
              >
                Carbon Token to Offset
              </label>
              <Field
                as="select"
                id="carbonToken"
                name="carbonToken"
                value={values.carbonToken}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  changeOptionsCarbonToken(
                    e.target.value,
                    values.paymentMethod
                  );
                  setFieldValue("carbonToken", e.target.value);
                  setFieldValue("offsetMethod", e.target.value);
                }}
              >
                {carbonTokens?.map(
                  (carbonToken: { key: string; value: string }) => {
                    return (
                      <option key={carbonToken.value} value={carbonToken.value}>
                        {carbonToken.key}
                      </option>
                    );
                  }
                )}
              </Field>
              <ErrorMessage
                name="carbonToken"
                component="p"
                className="font-medium text-red-400"
              />
            </div>
            {/* Offset Method Manual Select */}
            <div className="flex flex-col justify-between gap-2">
              <label
                className="text-sm font-bold text-fontPrimary dark:text-fontPrimaryDark"
                htmlFor="offsetMethod"
              >
                Select Offset Method
              </label>
              <Field
                as="select"
                id="offsetMethod"
                name="offsetMethod"
                value={values.offsetMethod}
              >
                {offsetMethods?.map(
                  (offsetMethod: { key: string; value: string }) => {
                    return (
                      <option
                        key={offsetMethod.value}
                        value={offsetMethod.value}
                      >
                        {offsetMethod.key}
                      </option>
                    );
                  }
                )}
              </Field>
              <ErrorMessage
                name="offsetMethod"
                component="p"
                className="font-medium text-red-400"
              />
            </div>
            {/* Amount to Offset Manual Select */}
            <div
              key="amountToOffset"
              className="flex flex-col justify-between gap-2"
            >
              <label
                htmlFor="amountToOffset"
                className="text-sm font-bold md:text-base text-fontPrimary dark:text-fontPrimaryDark"
              >
                Select Amount of {values.offsetMethod.toUpperCase()} to Offset
              </label>
              <Field
                id="amountToOffset"
                name="amountToOffset"
                type="number"
                className="input"
              />
              <ErrorMessage
                name="amountToOffset"
                component="p"
                className="font-medium text-red-400"
              />
            </div>
            <button className="p-2 bg-blue-300 rounded-md" type="submit">
              Submit
            </button>
          </Form>
=======
          <>
            <Form>
              <div className="w-[500px] p-5 border-2 border-black">
                {/* Payment Method Manual Select */}
                <div className="flex flex-col justify-between gap-2">
                  <label
                    className="text-sm font-bold text-fontPrimary dark:text-fontPrimaryDark"
                    htmlFor="paymentMethod"
                  >
                    Payment Method
                  </label>
                  <Field
                    as="select"
                    id="paymentMethod"
                    name="paymentMethod"
                    value={values.paymentMethod}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      // Changing subsequent select options depending on which payment method is chosen
                      changeOptionsPaymentMethod(e.target.value);
                      setFieldValue("paymentMethod", e.target.value);
                      setFieldValue("carbonToken", e.target.value);
                      setFieldValue("offsetMethod", e.target.value);
                    }}
                  >
                    {paymentMethods?.map(
                      (paymentMethod: { key: string; value: string }) => {
                        return (
                          <option
                            key={paymentMethod.value}
                            value={paymentMethod.value}
                          >
                            {paymentMethod.key}
                          </option>
                        );
                      }
                    )}
                  </Field>
                  <ErrorMessage
                    name="paymentMethod"
                    component="p"
                    className="font-medium text-red-400"
                  />
                </div>
                {/* Carbon Token Manual Select */}
                <div className="flex flex-col justify-between gap-2">
                  <label
                    className="text-sm font-bold text-fontPrimary dark:text-fontPrimaryDark"
                    htmlFor="carbonToken"
                  >
                    Carbon Token to Offset
                  </label>
                  <Field
                    as="select"
                    id="carbonToken"
                    name="carbonToken"
                    value={values.carbonToken}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      changeOptionsCarbonToken(
                        e.target.value,
                        values.paymentMethod
                      );
                      setFieldValue("carbonToken", e.target.value);
                      setFieldValue("offsetMethod", e.target.value);
                    }}
                  >
                    {carbonTokens?.map(
                      (carbonToken: { key: string; value: string }) => {
                        return (
                          <option
                            key={carbonToken.value}
                            value={carbonToken.value}
                          >
                            {carbonToken.key}
                          </option>
                        );
                      }
                    )}
                  </Field>
                  <ErrorMessage
                    name="carbonToken"
                    component="p"
                    className="font-medium text-red-400"
                  />
                </div>
                {/* Offset Method Manual Select */}
                <div className="flex flex-col justify-between gap-2">
                  <label
                    className="text-sm font-bold text-fontPrimary dark:text-fontPrimaryDark"
                    htmlFor="offsetMethod"
                  >
                    Select Offset Method
                  </label>
                  <Field
                    as="select"
                    id="offsetMethod"
                    name="offsetMethod"
                    value={values.offsetMethod}
                  >
                    {offsetMethods?.map(
                      (offsetMethod: { key: string; value: string }) => {
                        return (
                          <option
                            key={offsetMethod.value}
                            value={offsetMethod.value}
                          >
                            {offsetMethod.key}
                          </option>
                        );
                      }
                    )}
                  </Field>
                  <ErrorMessage
                    name="offsetMethod"
                    component="p"
                    className="font-medium text-red-400"
                  />
                </div>
                {/* Amount to Offset Manual Select */}
                <div
                  key="amountToOffset"
                  className="flex flex-col justify-between gap-2"
                >
                  <label
                    htmlFor="amountToOffset"
                    className="text-sm font-bold md:text-base text-fontPrimary dark:text-fontPrimaryDark"
                  >
                    Select Amount of {values.offsetMethod.toUpperCase()} to
                    Offset
                  </label>
                  <Field
                    id="amountToOffset"
                    name="amountToOffset"
                    type="number"
                    className="input"
                  />
                  <ErrorMessage
                    name="amountToOffset"
                    component="p"
                    className="font-medium text-red-400"
                  />
                </div>
                {/* Offset Button */}
                <div className="text-center">
                  <button
                    className="px-4 py-2 text-white bg-green-500 rounded-sm hover:bg-green-300 drop-shadow-lg"
                    type="submit"
                  >
                    OFFSET
                  </button>
                </div>
              </div>
            </Form>
            <Select
              label="Your favorite framework/library"
              placeholder="Pick one"
              data={[
                { value: "react", label: "React" },
                { value: "ng", label: "Angular" },
                { value: "svelte", label: "Svelte" },
                { value: "vue", label: "Vue" },
              ]}
            />
          </>
>>>>>>> mantine-form
        );
      }}
    </Formik>
  );
};

export default FormikContainer;
