import { BigNumber, ethers } from "ethers";
import { OffsetHelperABI } from "../constants";
import addresses, { OHPolygonAddress } from "../constants/constants";

const handleEstimate = async (
  paymentMethod: string,
  carbonToken: string,
  amountToOffset: number,
  offsetMethod: string
) => {
  if (paymentMethod === "matic") {
    if (offsetMethod === "bct" || offsetMethod === "nct") {
      // paymentMethod: MATIC
      // offsetMethod: Specify BCT/NCT

      const expectedEthAmount = await calculateNeededETHAmount(
        carbonToken,
        ethers.utils.parseEther(amountToOffset.toString())
      );

      return expectedEthAmount;
    } else if (offsetMethod === "matic") {
      // paymentMethod: MATIC
      // offsetMethod: Specify MATIC
      const expectedPoolTokensForEth = await calculateExpectedPoolTokenForETH(
        ethers.utils.parseEther(amountToOffset.toString()),
        carbonToken
      );

      return expectedPoolTokensForEth;
    }
  } else if (
    paymentMethod === "wmatic" ||
    paymentMethod === "usdc" ||
    paymentMethod === "weth"
  ) {
    if (offsetMethod === "bct" || offsetMethod === "nct") {
      // paymentMethod: WMATIC/USDC/WETH
      // offsetMethod: Specify BCT/NCT
      const neededTokenAmount = await calculateNeededTokenAmount(
        paymentMethod,
        carbonToken,
        ethers.utils.parseEther(amountToOffset.toString())
      );

      return neededTokenAmount;
    } else if (offsetMethod === "wmatic" || offsetMethod === "weth") {
      // offsetMethod: Specify WMATIC/WETH
      // paymentMethod: WMATIC/WETH
      const expectedPoolTokenForToken =
        await calculateExpectedPoolTokenForToken(
          paymentMethod,
          carbonToken,
          ethers.utils.parseEther(amountToOffset.toString())
        );

      return expectedPoolTokenForToken;
    } else if (offsetMethod === "usdc") {
      // offsetMethod: Specify USDC
      // paymentMethod: USDC
      const expectedUSDCForToken = await calculateExpectedPoolTokenForToken(
        paymentMethod,
        carbonToken,
        // USDC has 6 decimals unlike other ERC20s that have 18
        ethers.utils.parseUnits(amountToOffset.toString(), 6)
      );

      return expectedUSDCForToken;
    }
  }
};

export default handleEstimate;

const calculateNeededETHAmount = async (
  carbonToken: string,
  amountToOffset: BigNumber
) => {
  // @ts-ignore
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, provider);

  const poolToken = carbonToken === "bct" ? addresses.bct : addresses.nct;

  const expectedEthAmountRaw: BigNumber = await oh.calculateNeededETHAmount(
    poolToken,
    amountToOffset
  );

  return expectedEthAmountRaw;
};

const calculateExpectedPoolTokenForETH = async (
  amountToOffset: BigNumber,
  carbonToken: string
) => {
  // @ts-ignore
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, provider);

  const poolToken = carbonToken === "bct" ? addresses.bct : addresses.nct;

  const expectedPoolTokensForEthRaw: BigNumber =
    await oh.calculateExpectedPoolTokenForETH(amountToOffset, poolToken);

  return expectedPoolTokensForEthRaw;
};

const calculateNeededTokenAmount = async (
  paymentMethod: string,
  carbonToken: string,
  amountToOffset: BigNumber
) => {
  // @ts-ignore
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, provider);

  const fromToken = addresses[paymentMethod];
  const poolToken = carbonToken === "bct" ? addresses.bct : addresses.nct;

  const neededTokenAmountRaw: BigNumber = await oh.calculateNeededTokenAmount(
    fromToken,
    poolToken,
    amountToOffset
  );

  // USDC has 6 decimals unlike other ERC20s that have 18
  // const neededTokenAmount =
  //   paymentMethod === "usdc"
  //     ? (parseInt(neededTokenAmountRaw.toString()) / 10 ** 6).toFixed(2)
  //     : (parseInt(neededTokenAmountRaw.toString()) / 10 ** 18).toFixed(2);

  return neededTokenAmountRaw;
};

const calculateExpectedPoolTokenForToken = async (
  paymentMethod: string,
  carbonToken: string,
  amountToOffset: BigNumber
) => {
  // @ts-ignore
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, provider);

  const fromToken = addresses[paymentMethod];

  const poolToken = carbonToken === "bct" ? addresses.bct : addresses.nct;

  const expectedPoolTokenForTokenRaw: BigNumber =
    await oh.calculateExpectedPoolTokenForToken(
      fromToken,
      amountToOffset,
      poolToken
    );

  return expectedPoolTokenForTokenRaw;
};
