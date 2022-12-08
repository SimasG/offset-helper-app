import { MdKeyboardArrowDown } from "react-icons/md";

const SelectComponent = () => {
  const paymentMethods: { key: string; value: string }[] = [
    { key: "Select an option", value: "" },
    { key: "BCT", value: "bct" },
    { key: "NCT", value: "nct" },
    { key: "WMATIC", value: "wmatic" },
    { key: "USDC", value: "usdc" },
    { key: "WETH", value: "weth" },
    { key: "MATIC", value: "matic" },
  ];

  return (
    // Select menu
    <div className="w-[380px] my-[150px] mx-auto">
      {/* Select btn */}
      <div className="flex h-[55px] bg-white p-5 text-base font-normal rounded-lg items-center justify-between cursor-pointer shadow-sm">
        {/* Btn text */}
        <span>Select an option</span>
        <MdKeyboardArrowDown className="text-2xl" />
      </div>

      {/* Options */}
      <ul className="relative p-5 rounded-lg mt-[10px] shadow-sm bg-white">
        {/* Option */}
        <li className="">
          <span>BCT</span>
        </li>
        {/* Option */}
        <li>
          <span>NCT</span>
        </li>
        {/* Option */}
        <li>
          <span>WMATIC</span>
        </li>
        {/* Option */}
        <li>
          <span>USDC</span>
        </li>
        {/* Option */}
        <li>
          <span>WETH</span>
        </li>
        {/* Option */}
        <li>
          <span>MATIC</span>
        </li>
      </ul>
    </div>
  );
};

export default SelectComponent;
