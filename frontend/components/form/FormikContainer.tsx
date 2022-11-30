"use client";

import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { initialValuesProps } from "../../lib/types";
import FormikControl from "./FormikControl";

const FormikContainer = () => {
  const initialValues: initialValuesProps = {
    paymentMethod: "",
    carbonToken: "",
    offsetMethod: "",
    amountToOffset: 0,
  };
  const validationSchema = Yup.object({
    paymentMethod: Yup.string().required("Required"),
    carbonToken: Yup.string().required("Required"),
    offsetMethod: Yup.string().required("Required"),
    amountToOffset: Yup.number().required("Required"),
  });
  const onSubmit = async (values: any) => console.log("Form data:", values);

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
  // Changing carbon token to offset option array according to which payment method was selected
  // E.g. if BCT payment method was selected, pre-select BCT as the carbon token to offset
  const getCarbonTokens = (paymentMethod: string) => {
    if (paymentMethod === "bct") {
      carbonTokens = [{ key: "BCT", value: "bct" }];
    }
    if (paymentMethod === "nct") {
      carbonTokens = [{ key: "NCT", value: "nct" }];
    }
    if (paymentMethod === "") {
      carbonTokens = [
        { key: "Select an option", value: "" },
        { key: "BCT", value: "bct" },
        { key: "NCT", value: "nct" },
      ];
    }
    return carbonTokens;
  };

  // Changing offset method option array according to which payment method was selected
  // E.g. if BCT payment method was selected, pre-select "Specify BCT" as the offset method
  const getOffsetMethods = (paymentMethod: string) => {
    if (paymentMethod === "bct") {
      offsetMethods = [{ key: "Specify BCT", value: "bct" }];
    }
    if (paymentMethod === "nct") {
      offsetMethods = [{ key: "Specify NCT", value: "nct" }];
    }
    if (paymentMethod === "") {
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
    return offsetMethods;
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
        const {
          values,
          dirty,
          isSubmitting,
          handleChange,
          handleSubmit,
          handleReset,
          setFieldValue,
        } = formik;
        return (
          <Form>
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
                  // Changing carbon token array depending on which payment method is chosen
                  getCarbonTokens(e.target.value);
                  getOffsetMethods(e.target.value);
                  setFieldValue("paymentMethod", e.target.value);
                  setFieldValue("carbonToken", e.target.value);
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
                Select Amount to Offset
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
        );
      }}
    </Formik>
  );
};

export default FormikContainer;
