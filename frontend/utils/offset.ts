import { BigNumber, ethers } from "ethers";
import { toast } from "react-hot-toast";
import { erc20ABI } from "wagmi";
import { OffsetHelperABI } from "../constants";
import addresses, { OHPolygonAddress } from "../constants/constants";

/**
 * @description runs the applicable offset function
 * If paymentMethod = BCT/NCT -> autoOffsetPoolToken()
 * If paymentMethod = MATIC & offsetMethod = BCT/NCT -> autoOffsetExactOutETH()
 * If paymentMethod = MATIC & offsetMethod = MATIC -> autoOffsetExactInETH()
 * If paymentMethod = WMATIC/USDC/WETH & offsetMethod = BCT/NCT -> autoOffsetExactOutToken()
 * If paymentMethod = WMATIC/USDC/WETH & offsetMethod = WMATIC/USDC/WETH -> autoOffsetExactInToken()
 * @param paymentMethod payment method selected by user
 * @param offsetMethod offset method selected by user
 * @param amountToOffset amount to offset selected by user
 */
const handleOffset = async ({
  paymentMethod,
  offsetMethod,
  amountToOffset,
  estimate,
}: {
  paymentMethod: string;
  offsetMethod: string;
  amountToOffset: number | undefined;
  estimate: BigNumber | undefined;
}) => {
  // if amountToOffset === undefined | null, then 0
  amountToOffset = amountToOffset ?? 0;
  if (paymentMethod === "bct" || paymentMethod === "nct") {
    const tx = await autoOffsetPoolToken(paymentMethod, amountToOffset);
    return tx;
  } else if (paymentMethod === "matic") {
    if (offsetMethod === "bct" || offsetMethod === "nct") {
      const tx = await autoOffsetExactOutETH({
        offsetMethod: offsetMethod,
        amountToOffset: amountToOffset,
        estimate: estimate,
      });
      return tx;
    } else {
      const tx = await autoOffsetExactInETH(offsetMethod, amountToOffset);
      return tx;
    }
  } else {
    if (offsetMethod === "bct" || offsetMethod === "nct") {
      const tx = await autoOffsetExactOutToken({
        paymentMethod: paymentMethod,
        offsetMethod: offsetMethod,
        amountToOffset: amountToOffset,
        estimate: estimate,
      });
      return tx;
    } else {
      const tx = await autoOffsetExactInToken({
        paymentMethod: paymentMethod,
        offsetMethod: offsetMethod,
        amountToOffset: amountToOffset,
        estimate: estimate,
      });
      return tx;
    }
  }
};

export default handleOffset;

/**
 * @description `handleOffset` helper: offsets pool token directly (no swaps are necessary)
 * @param paymentMethod payment method selected by user
 * @param amountToOffset amount to offset selected by user
 */
const autoOffsetPoolToken = async (
  paymentMethod: string,
  amountToOffset: number
) => {
  // @ts-ignore
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, signer);

  const poolToken = paymentMethod === "bct" ? addresses.bct : addresses.nct;

  const poolTokenContract = new ethers.Contract(poolToken, erc20ABI, signer);

  const userAddress = await signer.getAddress();

  const userPoolTokenBalance: BigNumber = await poolTokenContract.balanceOf(
    userAddress
  );

  const amountToOffsetBN = ethers.utils.parseEther(amountToOffset.toString());

  if (
    parseFloat(ethers.utils.formatEther(userPoolTokenBalance)) <
    parseFloat(ethers.utils.formatEther(amountToOffsetBN))
  ) {
    toast.error(`Insufficient ${paymentMethod.toUpperCase()} balance`);
    return;
  }

  await (
    await poolTokenContract.approve(
      OHPolygonAddress,
      ethers.utils.parseEther(amountToOffset.toString())
    )
  ).wait();

  const offsetTx = await oh.autoOffsetPoolToken(
    poolToken,
    ethers.utils.parseEther(amountToOffset.toString())
  );
  await offsetTx.wait();

  return offsetTx;
};

/**
 * @description `handleOffset` helper: offsets specified amount of pool token using MATIC
 * @param offsetMethod offset method selected by user
 * @param amountToOffset amount to offset selected by user
 */
const autoOffsetExactOutETH = async ({
  offsetMethod,
  amountToOffset,
  estimate,
}: {
  offsetMethod: string;
  amountToOffset: number;
  estimate: BigNumber | undefined;
}) => {
  // @ts-ignore
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, signer);

  const poolToken = offsetMethod === "bct" ? addresses.bct : addresses.nct;

  const userBalance = await signer.getBalance();

  if (estimate) {
    if (
      parseFloat(ethers.utils.formatEther(userBalance)) <
      parseFloat(ethers.utils.formatEther(estimate))
    ) {
      toast.error(`Insufficient MATIC balance`);
      return;
    }
  }

  // ** Not sure why I don't need to approve the MATIC tx here
  const offsetTx = await oh.autoOffsetExactOutETH(
    poolToken,
    ethers.utils.parseEther(amountToOffset.toString()),
    {
      value: estimate,
    }
  );
  await offsetTx.wait();

  return offsetTx;
};

/**
 * @description `handleOffset` helper: offsets pool token using specified amount of MATIC
 * @param offsetMethod offset method selected by user
 * @param amountToOffset amount to offset selected by user
 */
const autoOffsetExactInETH = async (
  offsetMethod: string,
  amountToOffset: number
) => {
  // @ts-ignore
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, signer);

  const poolToken = offsetMethod === "bct" ? addresses.bct : addresses.nct;

  const userBalance = await signer.getBalance();

  const amountToOffsetBN = ethers.utils.parseEther(amountToOffset.toString());

  if (
    parseFloat(ethers.utils.formatEther(userBalance)) <
    parseFloat(ethers.utils.formatEther(amountToOffsetBN))
  ) {
    toast.error("Insufficient MATIC balance");
    return;
  }

  // ** Not sure why I don't need to approve the MATIC tx here
  const offsetTx = await oh.autoOffsetExactInETH(poolToken, {
    value: ethers.utils.parseEther(amountToOffset.toString()),
  });

  await offsetTx.wait();

  return offsetTx;
};

/**
 * @description `handleOffset` helper: offsets specified amount of pool token using WMATIC/USDC/WETH
 * @param paymentMethod payment method selected by user
 * @param offsetMethod offset method selected by user
 * @param amountToOffset amount to offset selected by user
 */
const autoOffsetExactOutToken = async ({
  paymentMethod,
  offsetMethod,
  amountToOffset,
  estimate,
}: {
  paymentMethod: string;
  offsetMethod: string;
  amountToOffset: number;
  estimate: BigNumber | undefined;
}) => {
  // @ts-ignore
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, signer);

  const poolToken = offsetMethod === "bct" ? addresses.bct : addresses.nct;

  const depositedToken = addresses[paymentMethod];

  const depositedTokenContract = new ethers.Contract(
    depositedToken,
    erc20ABI,
    signer
  );

  const userAddress = await signer.getAddress();

  const userTokenBalance = await depositedTokenContract.balanceOf(userAddress);

  // Checking if there's enough token to be offset in user's balance
  if (estimate) {
    if (paymentMethod === "usdc") {
      if (
        parseFloat(ethers.utils.formatUnits(userTokenBalance, 6)) <
        parseFloat(ethers.utils.formatUnits(estimate, 6))
      ) {
        toast.error(`Insufficient ${paymentMethod.toUpperCase()} balance`);
        return;
      }
    } else {
      if (
        parseFloat(ethers.utils.formatEther(userTokenBalance)) <
        parseFloat(ethers.utils.formatEther(estimate))
      ) {
        toast.error(`Insufficient ${paymentMethod.toUpperCase()} balance`);
        return;
      }
    }
  }

  await (
    await depositedTokenContract.approve(OHPolygonAddress, estimate)
  ).wait();

  const offsetTx = await oh.autoOffsetExactOutToken(
    depositedToken,
    poolToken,
    ethers.utils.parseEther(amountToOffset.toString())
  );
  await offsetTx.wait();

  return offsetTx;
};

/**
 * @description `handleOffset` helper: offsets pool token using specified amount of WMATIC/USDC/WETH
 * @param paymentMethod payment method selected by user
 * @param offsetMethod offset method selected by user
 * @param amountToOffset amount to offset selected by user
 */
const autoOffsetExactInToken = async ({
  paymentMethod,
  offsetMethod,
  amountToOffset,
  estimate,
}: {
  paymentMethod: string;
  offsetMethod: string;
  amountToOffset: number;
  estimate: BigNumber | undefined;
}) => {
  // @ts-ignore
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const oh = new ethers.Contract(OHPolygonAddress, OffsetHelperABI, signer);

  const poolToken = offsetMethod === "bct" ? addresses.bct : addresses.nct;

  const depositedToken = addresses[paymentMethod];

  const depositedTokenContract = new ethers.Contract(
    depositedToken,
    erc20ABI,
    signer
  );

  const userAddress = await signer.getAddress();

  const userTokenBalance = await depositedTokenContract.balanceOf(userAddress);

  const amountToOffsetBN =
    paymentMethod === "usdc"
      ? ethers.utils.parseUnits(amountToOffset.toString(), 6)
      : ethers.utils.parseEther(amountToOffset.toString());

  if (
    parseFloat(ethers.utils.formatEther(userTokenBalance)) <
    parseFloat(ethers.utils.formatEther(amountToOffsetBN))
  ) {
    toast.error(`Insufficient ${paymentMethod.toUpperCase()} balance`);
    return;
  }

  await (
    await depositedTokenContract.approve(OHPolygonAddress, estimate)
  ).wait();

  const offsetTx = await oh.autoOffsetExactInToken(
    depositedToken,
    amountToOffsetBN,
    poolToken
  );

  await offsetTx.wait();

  return offsetTx;
};
