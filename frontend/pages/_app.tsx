import "../styles/globals.css";
import type { AppProps } from "next/app";

// Additional `rainbowkit` & `wagmi` setup
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig, chain } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

// `chains` -> array of chains we want to support
const { chains, provider } = configureChains(
  [chain.polygonMumbai],
  [publicProvider()]
);

// `connectors` are the wallets we'll support
// Creating a list of connectors we'll support on rainbowkit
// & sharing the list with the wagmiClient
const { connectors } = getDefaultWallets({
  appName: "Offset Helper App",
  chains,
});

// Initializing a wagmi client that combines all the above information, that RainbowKit
// will use under the hood
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
