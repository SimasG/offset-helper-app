import { FormikControlSchema } from "../../lib/types";
import Input from "./Input";
import Select from "../../app/Select";

const FormikControl = ({ control, ...rest }: FormikControlSchema) => {
  switch (control) {
    case "input":
      return <Input {...rest} />;
    case "select":
      return <Select {...rest} />;
    default:
      return null;
  }
};

export default FormikControl;
