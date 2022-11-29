import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="absolute flex items-center justify-center w-full h-full gap-10">
      <main>
        {/* Pay In Select */}
        <div>
          <label htmlFor="pay-select" className="block text-xl">
            Pay in:
          </label>
          <select name="payment-selections" id="pay-select">
            <option value="">--Please choose an option--</option>
            <option value="BCT">BCT</option>
            <option value="NCT">NCT</option>
            <option value="WMATIC">WMATIC</option>
            <option value="USDC">USDC</option>
            <option value="WETH">WETH</option>
            <option value="MATIC">MATIC</option>
          </select>
        </div>
        {/* Carbon Token to Offset */}
        <div>
          <label htmlFor="carbon-token-offset" className="block text-xl">
            Carbon Token to Offset:
          </label>
          <select
            name="carbon-token-offset-selections"
            id="carbon-token-offset"
          >
            <option value="">--Please choose an option--</option>
            <option value="BCT">BCT</option>
            <option value="NCT">NCT</option>
          </select>
        </div>
        {/* Select Offset Method */}
        <div>
          <label htmlFor="select-offset-method" className="block text-xl">
            Select Offset Method:
          </label>
          <select name="offset-method-selections" id="select-offset-method">
            <option value="">--Please choose an option--</option>
            <option value="BCT">BCT</option>
            <option value="NCT">NCT</option>
            <option value="WMATIC">WMATIC</option>
            <option value="USDC">USDC</option>
            <option value="WETH">WETH</option>
            <option value="MATIC">MATIC</option>
          </select>
        </div>
        {/* Select Amount to Offset */}
        <div>
          <p className="block text-xl">Select Amount to Offset:</p>
          <input type="number" />
        </div>
        <button className="w-full px-8 py-2 m-auto text-white bg-green-400 rounded-md">
          Offset
        </button>
      </main>
    </div>
  );
};

export default Home;
