import type { NextPage } from "next";
import FormikContainer from "../components/form/FormikContainer";
import Header from "../components/Header";

const Home: NextPage = () => {
  return (
    <div>
      <Header />
      <div className="absolute flex items-center justify-center w-full h-full gap-10">
        <FormikContainer />
      </div>
    </div>
  );
};

export default Home;
