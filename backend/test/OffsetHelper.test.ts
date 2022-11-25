import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther, parseUnits } from "ethers/lib/utils";

import {
  IERC20,
  IERC20__factory,
  IWETH,
  IWETH__factory,
  IToucanPoolToken,
  IToucanPoolToken__factory,
  OffsetHelper,
  OffsetHelper__factory,
  Swapper,
  Swapper__factory,
} from "../typechain-types";
import addresses from "../utils/addresses";
import { BigNumber, providers } from "ethers";
import { sum as sumBN } from "../utils/bignumber";

const ONE_ETHER = parseEther("1.0");

// ** Is parsing USDC to 6 decimals instead of 18 just a matter of convention?
function parseUSDC(s: string): BigNumber {
  return parseUnits(s, 6);
}

describe("OffsetHelper", function () {
  let offsetHelper: OffsetHelper;
  let swapper: Swapper;
  let bct: IToucanPoolToken;
  let nct: IToucanPoolToken;
  let weth: IERC20;
  let wmatic: IWETH;
  let usdc: IERC20;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  beforeEach(async function () {
    [addr1, addr2, ...addrs] = await ethers.getSigners();

    // Creating `OffsetHelper` contract factory & linking it with a signer account
    const offsetHelperFactory = (await ethers.getContractFactory(
      "OffsetHelper",
      addr2
    )) as OffsetHelper__factory;

    // Deploying `OffsetHelper` contract factory
    offsetHelper = await offsetHelperFactory.deploy(
      ["BCT", "NCT", "USDC", "WETH", "WMATIC"],
      [
        addresses.bct,
        addresses.nct,
        addresses.usdc,
        addresses.weth,
        addresses.wmatic,
      ]
    );

    // Connecting factory contracts with different signers
    // ** How does adding `addresses.bct` etc work?
    // ** How are we able to use interfaces instead of the actual contracts?
    bct = IToucanPoolToken__factory.connect(addresses.bct, addr2);
    nct = IToucanPoolToken__factory.connect(addresses.nct, addr2);
    usdc = IERC20__factory.connect(addresses.usdc, addr2);
    weth = IERC20__factory.connect(addresses.weth, addr2);
    wmatic = IWETH__factory.connect(addresses.wmatic, addr2);
  });

  before(async () => {
    [addr1, addr2, ...addrs] = await ethers.getSigners();

    const swapperFactory = (await ethers.getContractFactory(
      "Swapper",
      addr2
    )) as Swapper__factory;

    swapper = await swapperFactory.deploy(
      ["BCT", "NCT", "USDC", "WETH", "WMATIC"],
      [
        addresses.bct,
        addresses.nct,
        addresses.usdc,
        addresses.weth,
        addresses.wmatic,
      ]
    );

    // Sending all but one ETH from every address to addr2
    // ** Why?
    await Promise.all(
      addrs.map(async (addr) => {
        await addr.sendTransaction({
          to: addr2.address,
          value: (await addr.getBalance()).sub(ONE_ETHER),
        });
      })
    );

    // Sending 1000WMATIC to addr2?
    await IWETH__factory.connect(addresses.wmatic, addr2).deposit({
      value: parseEther("1000"),
    });

    // ** Why are we doing all this swapping?

    // ** Are we swapping x WMATIC to 20 WETH?
    await swapper.swap(addresses.weth, parseEther("20.0"), {
      value: await swapper.calculateNeededETHAmount(
        addresses.weth,
        parseEther("20.0")
      ),
    });

    // ** Are we swapping x WMATIC to 1000 USDC?
    await swapper.swap(addresses.usdc, parseUSDC("1000"), {
      value: await swapper.calculateNeededETHAmount(
        addresses.usdc,
        parseUSDC("1000")
      ),
    });

    // ** Are we swapping x WMATIC to 50 BCT?
    await swapper.swap(addresses.bct, parseEther("50.0"), {
      value: await swapper.calculateNeededETHAmount(
        addresses.bct,
        parseEther("50.0")
      ),
    });

    // ** Are we swapping x WMATIC to 50 NCT?
    await swapper.swap(addresses.nct, parseEther("50.0"), {
      value: await swapper.calculateNeededETHAmount(
        addresses.nct,
        parseEther("50.0")
      ),
    });
  });

  // ** Why is token's value a function?
  const TOKEN_POOLS = [
    { name: "NCT", token: () => nct },
    { name: "BCT", token: () => bct },
  ];

  describe("#autoOffsetExactInToken()", function () {
    // Retire specified WETH/USDC/WMATIC -> BCT/NCT
    // ** Why can't we just use `autoOffsetExactInToken()`
    // ** instead of recreating it in `retireFixedInToken`?
    async function retireFixedInToken(
      fromToken: IERC20,
      fromAmount: BigNumber,
      poolToken: IToucanPoolToken
    ) {
      // Calculating expected # of BCT/NCT retired
      const expOffset = await offsetHelper.calculateExpectedPoolTokenForToken(
        fromToken.address,
        fromAmount,
        poolToken.address
      );
      expect(expOffset).to.be.greaterThan(0);

      // Prompting msg.sender to approve sending `fromAmount` (i.e. 20)
      // `fromToken` (i.e. WMATIC) to the OffsetHelper contract
      await fromToken.approve(offsetHelper.address, fromAmount);

      const supplyBefore = await poolToken.totalSupply();
      await expect(
        offsetHelper.autoOffsetExactInToken(
          fromToken.address,
          fromAmount,
          poolToken.address
        )
      )
        .to.emit(offsetHelper, "Redeemed")
        .withArgs(
          addr2.address,
          poolToken.address,
          anyValue,
          (amounts: BigNumber[]) => {
            return expOffset == sumBN(amounts);
          }
        )
        .and.to.changeTokenBalance(
          fromToken,
          addr2.address,
          fromAmount.mul(-1)
        );

      const supplyAfter = await poolToken.totalSupply();
      expect(supplyBefore).to.equal(supplyAfter.add(expOffset));
      // Or this, same logic
      // expect(supplyBefore.sub(supplyAfter)).to.equal(expOffset);
    }

    TOKEN_POOLS.forEach((pool) => {
      it(`should retire 1 WETH for ${pool.name} redemption`, async function () {
        await retireFixedInToken(weth, ONE_ETHER, pool.token());
      });
      it(`should retire 100 USDC for ${pool.name} redemption`, async function () {
        await retireFixedInToken(usdc, parseUSDC("100"), pool.token());
      });
      it(`should retire 20 WMATIC for ${pool.name} redemption`, async function () {
        await retireFixedInToken(wmatic, parseEther("20"), pool.token());
      });
    });
  });

  describe("#autoOffsetExactInETH()", function () {});
});
