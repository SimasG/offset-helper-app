import { BigNumber, ethers } from "ethers";
import { OffsetHelperABI } from "../constants";
import addresses, { OHPolygonAddress } from "../constants/constants";

/**
 * @description runs the applicable estimate function
 * @param paymentMethod payment method selected by user
 * @param carbonToken carbon token selected by user
 * @param amountToOffset amount to offset selected by user
 * @param offsetMethod offset method selected by user
 * @returns pool token offset or payment method estimate (BigNumber)
 */
const handleEstimate = async ({
  paymentMethod,
  carbonToken,
  amountToOffset,
  offsetMethod,
}: {
  paymentMethod: string;
  carbonToken: string;
  amountToOffset: number;
  offsetMethod: string;
}) => {
  try {
    if (paymentMethod === "matic") {
      if (offsetMethod === "bct" || offsetMethod === "nct") {
        // paymentMethod: MATIC || offsetMethod: Specify BCT/NCT
        const expectedEthAmount = await calculateNeededETHAmount(
          carbonToken,
          ethers.utils.parseEther(amountToOffset.toString())
        );

        return expectedEthAmount;
      } else if (offsetMethod === "matic") {
        // paymentMethod: MATIC || offsetMethod: Specify MATIC
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
        // paymentMethod: WMATIC/USDC/WETH || offsetMethod: Specify BCT/NCT
        const neededTokenAmount = await calculateNeededTokenAmount({
          paymentMethod: paymentMethod,
          carbonToken: carbonToken,
          amountToOffset: ethers.utils.parseEther(amountToOffset.toString()),
        });

        return neededTokenAmount;
      } else if (offsetMethod === "wmatic" || offsetMethod === "weth") {
        // paymentMethod: WMATIC/WETH || offsetMethod: Specify WMATIC/WETH
        const expectedPoolTokenForToken =
          await calculateExpectedPoolTokenForToken({
            paymentMethod: paymentMethod,
            carbonToken: carbonToken,
            amountToOffset: ethers.utils.parseEther(amountToOffset.toString()),
          });

        return expectedPoolTokenForToken;
      } else if (offsetMethod === "usdc") {
        // paymentMethod: USDC || offsetMethod: Specify USDC
        const expectedUSDCForToken = await calculateExpectedPoolTokenForToken({
          paymentMethod: paymentMethod,
          carbonToken: carbonToken,
          // USDC has 6 decimals unlike other ERC20s that have 18
          amountToOffset: ethers.utils.parseUnits(amountToOffset.toString(), 6),
        });

        return expectedUSDCForToken;
      }
    }
  } catch (e) {
    // Most common error: INVALID_ARGUMENT once `amountToOffset` is > 1e+21
    console.error("error:", e);
  }
};

export default handleEstimate;

// `handleEstimate helpers`
/**
 * @description `handleEstimate` helper: estimates amount of MATIC required to offset specified amount of pool token
 * @param carbonToken carbon token selected by user
 * @param amountToOffset amount to offset selected by user
 * @returns estimated amount of MATIC required (BigNumber)
 */
const calculateNeededETHAmount = async (
  carbonToken: string,
  amountToOffset: BigNumber
) => {
  try {
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, provider);

    const poolToken = carbonToken === "bct" ? addresses.bct : addresses.nct;

    const neededETHAmount: BigNumber = await oh.calculateNeededETHAmount(
      poolToken,
      amountToOffset
    );

    return neededETHAmount;
  } catch (e) {
    // Most common error: liquidity exceeded
    console.error("error:", e);
  }
};

/**
 * @description `handleEstimate` helper: estimates amount of pool token to be offset given a specified amount of MATIC
 * @param amountToOffset amount to offset selected by user
 * @param carbonToken carbon token selected by user
 * @returns estimated amount of pool token to be offset (BigNumber)
 */
const calculateExpectedPoolTokenForETH = async (
  amountToOffset: BigNumber,
  carbonToken: string
) => {
  // @ts-ignore
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, provider);

  const poolToken = carbonToken === "bct" ? addresses.bct : addresses.nct;

  const expectedPoolTokenForETH: BigNumber =
    await oh.calculateExpectedPoolTokenForETH(amountToOffset, poolToken);

  return expectedPoolTokenForETH;
};

/**
 * @description `handleEstimate` helper: estimates amount of WMATIC/USDC/WETH required to offset specified amount of pool token
 * @param paymentMethod payment method selected by user
 * @param carbonToken carbon token selected by user
 * @param amountToOffset amount to offset selected by user
 * @returns estimated amount of WMATIC/USDC/WETH required (BigNumber)
 */
const calculateNeededTokenAmount = async ({
  paymentMethod,
  carbonToken,
  amountToOffset,
}: {
  paymentMethod: string;
  carbonToken: string;
  amountToOffset: BigNumber;
}) => {
  try {
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, provider);

    const fromToken = addresses[paymentMethod];

    const poolToken = carbonToken === "bct" ? addresses.bct : addresses.nct;

    const neededTokenAmount: BigNumber = await oh.calculateNeededTokenAmount(
      fromToken,
      poolToken,
      amountToOffset
    );

    return neededTokenAmount;
  } catch (e) {
    // Most common error: liquidity exceeded
    console.error("error:", e);
  }
};

/**
 * @description `handleEstimate` helper: estimates amount of pool token to be offset given a specified amount of WMATIC/USDC/WETH
 * @param paymentMethod payment method selected by user
 * @param carbonToken carbon token selected by user
 * @param amountToOffset amount to offset selected by user
 * @returns
 */
const calculateExpectedPoolTokenForToken = async ({
  paymentMethod,
  carbonToken,
  amountToOffset,
}: {
  paymentMethod: string;
  carbonToken: string;
  amountToOffset: BigNumber;
}) => {
  // @ts-ignore
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, provider);

  const fromToken = addresses[paymentMethod];

  const poolToken = carbonToken === "bct" ? addresses.bct : addresses.nct;

  const expectedPoolTokenForToken: BigNumber =
    await oh.calculateExpectedPoolTokenForToken(
      fromToken,
      amountToOffset,
      poolToken
    );

  return expectedPoolTokenForToken;
};
