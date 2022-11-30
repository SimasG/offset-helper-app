export type FormikControlSchema = {
  control: string;
  name: string;
  id?: string;
  placeholder?: string;
  type?: string;
  label?: string;
  className?: string;
  options?: {
    key: string;
    value: string;
  }[];
  values: initialValuesProps;
};

export type initialValuesProps = {
  paymentMethod: string;
  carbonToken: string;
  offsetMethod: string;
  amountToOffset: number;
};
