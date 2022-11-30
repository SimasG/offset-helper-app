      <main className="w-[50%] flex flex-col justify-center items-center gap-3">

            {/* <FormikControl
              control="select"
              label="Payment Method"
              name="paymentMethod"
              options={paymentMethods}
              values={values}
            />
            <FormikControl
              control="select"
              label="Carbon Token to Offset"
              name="carbonToken"
              options={carbonTokens}
              values={values}
            />
            <FormikControl
              control="select"
              label="Select Offset Method"
              name="offsetMethod"
              options={offsetMethods}
              values={values}
            />
            <FormikControl
              control="input"
              label="Select Amount to Offset"
              name="amountToOffset"
              type="number"
              values={values}
            /> */}

// Creating a config for Polygon's Mumbai Testnet chain (required by `rainbowkit` & `wagmi`)
const polygonMumbaiChain = {
id: 80001,
name: "Polygon Mumbai Testnet",
network: "mumbai",
nativeCurrency: {
decimals: 18,
name: "Matic",
symbol: "MATIC",
},
rpcUrls: {
default: "https://matic-testnet-archive-rpc.bwarelabs.com",
},
blockExplorers: {
default: {
name: "Polygonscan",
url: "https://mumbai.polygonscan.com",
},
},
testnet: true,
};
