import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Ubuntu } from "@next/font/google";
import { Toaster } from "react-hot-toast";

// Additional `rainbowkit` & `wagmi` setup
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  midnightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig, chain } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";
import Script from "next/script";

// Connecting chains we support with providers we have
// ** How are these providers different from providers we instantiate with ethers?
// ** I.e. `const provider = new ethers.providers.Web3Provider(window.ethereum)`
const { chains, provider } = configureChains(
  [chain.polygon],
  [
    publicProvider(),
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
  ]
);

// Creating an array of connectors (wallets) we'll support
// on RainbowKit & sharing the array with the wagmiClient
const { connectors } = getDefaultWallets({
  appName: "Offset Helper App",
  chains,
});

// Initializing a wagmi client that combines all the above
// information that RainbowKit will use under the hood
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ubuntu",
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <Toaster
        toastOptions={{
          style: {
            fontFamily: "Ubuntu, sans-serif",
            fontWeight: "medium",
          },
        }}
      />
      <RainbowKitProvider
        theme={midnightTheme({
          accentColor: "#0F3031",
        })}
        chains={chains}
      >
        <main className={ubuntu.className}>
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-08XNTEN86T"
            strategy="afterInteractive"
          ></Script>
          <Script id="google-analytics" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-08XNTEN86T');
  `}
          </Script>
          <Component {...pageProps} />
        </main>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
