import type { NextPage } from "next";
import FormikContainer from "../components/form/FormikContainer";

const Home: NextPage = () => {
  return (
    <div className="absolute flex items-center justify-center w-full h-full gap-10">
      <FormikContainer />
    </div>
  );
};

export default Home;
