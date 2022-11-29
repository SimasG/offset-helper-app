"use client";

import { Form, Formik } from "formik";
import * as Yup from "yup";
import { initialValuesProps } from "../../lib/types";
import FormikControl from "./FormikControl";

const FormikContainer = () => {
  const initialValues: initialValuesProps = {
    paymentMethod: "",
    carbonToken: "",
  };
  const validationSchema = Yup.object({
    paymentMethod: Yup.string().required("Required"),
    carbonToken: Yup.string().required("Required"),
  });
  const onSubmit = async (values: any) => console.log("Form data:", values);

  const paymentMethods: { key: string; value: string }[] = [
    { key: "Select an option", value: "" },
    { key: "BCT", value: "bct" },
    { key: "NCT", value: "nct" },
    { key: "WMATIC", value: "wmatic" },
    { key: "USDC", value: "usdc" },
    { key: "WETH", value: "weth" },
    { key: "MATIC", value: "matic" },
  ];

  const carbonTokens: { key: string; value: string }[] = [
    { key: "Select an option", value: "" },
    { key: "BCT", value: "bct" },
    { key: "NCT", value: "nct" },
  ];

  const offsetMethods: { key: string; value: string }[] = [
    { key: "Select an option", value: "" },
    { key: "Specify BCT", value: "bct" },
    { key: "Specify NCT", value: "nct" },
  ];

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {(formik) => (
        <Form>
          <FormikControl
            control="select"
            label="Payment Method"
            name="paymentMethod"
            options={paymentMethods}
          />
          <FormikControl
            control="select"
            label="Carbon Token to Offset"
            name="carbonToken"
            options={carbonTokens}
          />
          <FormikControl
            control="select"
            label="Select Offset Method"
            name="offsetMethods"
            options={offsetMethods}
          />
          <FormikControl
            control="input"
            label="Select Amount to Offset"
            name="amountToOffset"
            type="number"
          />
          <button className="p-2 bg-blue-300 rounded-md" type="submit">
            Submit
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default FormikContainer;
