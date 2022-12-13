import { ethers } from "ethers";
import { OffsetHelperABI } from "../constants";
import addresses, { OHPolygonAddress } from "../constants/constants";
// * Blockchain-related functionality
// If paymentMethod = BCT/NCT -> autoOffsetPoolToken()
// If paymentMethod = MATIC & offsetMethod = BCT/NCT -> autoOffsetExactOutETH()
// If paymentMethod = MATIC & offsetMethod = MATIC -> autoOffsetExactInETH()
// If paymentMethod = WMATIC/USDC/WETH & offsetMethod = BCT/NCT -> autoOffsetExactOutToken()

// If paymentMethod = WMATIC/USDC/WETH & offsetMethod = WMATIC/USDC/WETH -> autoOffsetExactInToken()
const offset = (
  paymentMethod: string,
  offsetMethod: string,
  amountToOffset: number
) => {
  if (paymentMethod === "bct" || paymentMethod === "nct") {
    // ** Can't test it out atm
    console.log("trigger autoOffsetPoolToken()");
  } else if (paymentMethod === "matic") {
    if (offsetMethod === "bct" || offsetMethod === "nct") {
      // * Doesn't work
      console.log("trigger autoOffsetExactOutETH()");
      autoOffsetExactOutETH(offsetMethod, amountToOffset);
    } else {
      // * Works. Why?
      console.log("trigger autoOffsetExactInETH()");
      autoOffsetExactInETH(offsetMethod, amountToOffset);
    }
  } else {
    if (offsetMethod === "bct" || offsetMethod === "nct") {
      // * Doesn't work
      console.log("trigger autoOffsetExactOutToken()");
      autoOffsetExactOutToken(paymentMethod, offsetMethod, amountToOffset);
    } else {
      console.log("trigger autoOffsetExactInToken()");
      // * Doesn't work
      autoOffsetExactInToken(paymentMethod, offsetMethod, amountToOffset);
    }
  }
};

export default offset;

// ** `UniswapV2Router: EXCESSIVE_INPUT_AMOUNT` if amountToOffset is > 0.
//  `UniswapV2Library: INSUFFICIENT_OUTPUT_AMOUNT` if amountToOffset is 0. Oke, I just can't have an input of 0, makes sense.
// Oke, now metamask tx is initiated but it says I'll need to pay 0 MATIC + gas. Doesn't make sense.
const autoOffsetExactOutETH = async (
  offsetMethod: string,
  amountToOffset: number
) => {
  const { ethereum } = window;

  // This seems to be a more specific provider, built on "jsonRpc provider"
  // @ts-ignore
  const provider = new ethers.providers.Web3Provider(ethereum);

  const signer = provider.getSigner();

  const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, signer);

  const poolToken = offsetMethod === "bct" ? addresses.bct : addresses.nct;

  const offsetTx = await oh.autoOffsetExactOutETH(
    poolToken,
    ethers.utils.parseEther(amountToOffset.toString())
  );
  await offsetTx.wait();
  console.log("offset hash", offsetTx.hash);
};

const autoOffsetExactInETH = async (
  offsetMethod: string,
  amountToOffset: number
) => {
  const { ethereum } = window;
  // @ts-ignore
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();

  const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, signer);

  const poolToken = offsetMethod === "bct" ? addresses.bct : addresses.nct;

  const offsetTx = await oh.autoOffsetExactInETH(poolToken, {
    value: ethers.utils.parseEther(amountToOffset.toString()),
  });

  await offsetTx.wait();
  console.log("offset hash", offsetTx.hash);
};

// ** `UNPREDICTABLE_GAS_LIMIT` if amountToOffset is > 0
// `UniswapV2Library: INSUFFICIENT_OUTPUT_AMOUNT` if amountToOffset is 0. Oke, I just can't have an input of 0, makes sense.
const autoOffsetExactOutToken = async (
  paymentMethod: string,
  offsetMethod: string,
  amountToOffset: number
) => {
  const { ethereum } = window;
  // @ts-ignore
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();

  const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, signer);

  const depositedToken =
    paymentMethod === "wmatic"
      ? addresses.wmatic
      : paymentMethod === "usdc"
      ? addresses.usdc
      : paymentMethod === "weth"
      ? addresses.weth
      : null;

  const poolToken = offsetMethod === "bct" ? addresses.bct : addresses.nct;

  const offsetTx = await oh.autoOffsetExactOutToken(
    depositedToken,
    poolToken,
    ethers.utils.parseEther(amountToOffset.toString())

    // FixedNumber.from(amountToOffset.toString())
  );
  await offsetTx.wait();
  console.log("offset hash", offsetTx.hash);
};

// ** `UNPREDICTABLE_GAS_LIMIT` if amountToOffset is >= 0
const autoOffsetExactInToken = async (
  paymentMethod: string,
  offsetMethod: string,
  amountToOffset: number
) => {
  const { ethereum } = window;
  // @ts-ignore
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();

  const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, signer);

  const poolToken = offsetMethod === "bct" ? addresses.bct : addresses.nct;

  const offsetTx = await oh.autoOffsetExactInToken(
    addresses[paymentMethod],
    ethers.utils.parseEther(amountToOffset.toString()),
    poolToken
  );

  await offsetTx.wait();
  console.log("offset hash", offsetTx.hash);
};
