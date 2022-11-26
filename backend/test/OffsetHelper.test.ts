import { IToucanContractRegistry } from "./../typechain-types/contracts/interfaces/IToucanContractRegistry";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { formatEther, parseEther, parseUnits } from "ethers/lib/utils";

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

  // WMATIC/USDC/WETH specified
  describe("#autoOffsetExactInToken()", function () {
    // Retire specified WETH/USDC/WMATIC -> BCT/NCT
    // ** Why can't we just use `autoOffsetExactInToken()`
    // ** instead of recreating it in `retireFixedInToken`?
    async function retireFixedInToken(
      fromToken: IERC20,
      fromAmount: BigNumber,
      poolToken: IToucanPoolToken
    ) {
      // Calculating expected # of BCT/NCT to be retired
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

  // MATIC specified
  describe("#autoOffsetExactInETH()", function () {
    async function retireFixedInETH(
      fromAmount: BigNumber,
      poolToken: IToucanPoolToken
    ) {
      // Calculating expected # of BCT/NCT to be retired
      const expOffset = await offsetHelper.calculateExpectedPoolTokenForETH(
        fromAmount,
        poolToken.address
      );
      expect(expOffset).to.be.greaterThan(0);

      const supplyBefore = await poolToken.totalSupply();

      // ** Since we're using `{value: ...}` syntax, does that mean that we'll automatically
      // ** send the chain's native currency (i.e. MATIC in this case)?
      await expect(
        offsetHelper.autoOffsetExactInETH(poolToken.address, {
          value: fromAmount,
        })
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
        .and.to.changeEtherBalance(addr2.address, fromAmount.mul(-1));

      const supplyAfter = await poolToken.totalSupply();

      expect(supplyBefore).to.equal(supplyAfter.add(expOffset));
    }

    TOKEN_POOLS.forEach((pool) => {
      it(`should retire 20 MATIC for ${pool.name} redemption`, async function () {
        await retireFixedInETH(parseEther("20"), pool.token());
      });
    });
  });

  // BCT/NCT specified
  // 1. autoOffsetExactOutToken(): WETH/USDC/WMATIC -> USDC -> BCT/NCT -> retire
  // 2. autoOffsetExactOutETH(): MATIC -> USDC -> BCT/NCT -> retire
  // 3. autoOffsetPoolToken(): BCT/NCT -> retire
  describe("#autoOffsetExactOut{ETH,Token}()", function () {
    // x MATIC -> y USDC -> 1 NCT -> 1 TCO2
    it("should retire 1.0 TCO2 using a MATIC swap and NCT redemption", async function () {
      // Setting initial state
      const maticBalanceBefore = await addr2.getBalance();
      const nctSupplyBefore = await nct.totalSupply();

      // Calculating the cost in MATIC of retiring 1.0 TCO2
      const maticCost = await offsetHelper.calculateNeededETHAmount(
        nct.address,
        ONE_ETHER
      );

      // ** Why do we not need to approve the tx here?
      // Offseting with `autoOffsetExactOutETH()`
      const txResponse = await offsetHelper.autoOffsetExactOutETH(
        nct.address,
        ONE_ETHER,
        {
          value: maticCost,
        }
      );
      const txReceipt = await txResponse.wait(1);

      // Calculating tx fees *for this exact tx*
      // ** Why are we multiplying tho?
      const txFees = txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice);

      // Setting new state
      const maticBalanceAfter = await addr2.getBalance();
      const nctSupplyAfter = await nct.totalSupply();

      // Comparing chain states
      expect(maticBalanceAfter.add(maticCost).add(txFees)).to.equal(
        maticBalanceBefore
      );
      expect(nctSupplyAfter).to.equal(nctSupplyBefore.sub(ONE_ETHER));
    });

    // 1 NCT -> 1 TCO2
    it("should retire 1.0 TCO2 using a NCT deposit and NCT redemption", async function () {
      // Setting initial state
      const nctBalanceBefore = await nct.balanceOf(addr2.address);
      const nctSupplyBefore = await nct.totalSupply();

      // Offsetting 1 NCT
      await (await nct.approve(offsetHelper.address, ONE_ETHER)).wait();
      await offsetHelper.autoOffsetPoolToken(nct.address, ONE_ETHER);

      // Setting new state after the tx
      const nctBalanceAfter = await nct.balanceOf(addr2.address);
      const nctSupplyAfter = await nct.totalSupply();

      // Testing
      expect(nctBalanceBefore.sub(nctBalanceAfter)).to.equal(ONE_ETHER);
      expect(nctSupplyBefore.sub(nctSupplyAfter)).to.equal(ONE_ETHER);
    });

    // 1. x WETH -> y USDC -> 1 NCT -> 1 TCO2
    // 2. x WETH -> y USDC -> 1 BCT -> 1 TCO2
    TOKEN_POOLS.forEach((pool) => {
      it.only(`should retire 1.0 TCO2 using a WETH swap and ${pool.name} redemption`, async function () {
        // Setting the initial chain state
        const wethBalanceBefore = await weth.balanceOf(addr2.address);
        const poolTokenSupplyBefore = await pool.token().totalSupply();

        // Calculating the cost in WETH of retiring 1.0 TCO2
        const wethCost = await offsetHelper.calculateNeededTokenAmount(
          addresses.weth,
          pool.name === "BCT" ? addresses.bct : addresses.nct,
          ONE_ETHER
        );

        await (await weth.approve(offsetHelper.address, wethCost)).wait();
        await offsetHelper.autoOffsetExactOutToken(
          addresses.weth,
          pool.name === "BCT" ? addresses.bct : addresses.nct,
          ONE_ETHER
        );

        // Setting the chain state after the transactions
        const wethBalanceAfter = await weth.balanceOf(addr2.address);
        const poolTokenSupplyAfter = await pool.token().totalSupply();

        expect(
          formatEther(wethBalanceBefore.sub(wethBalanceAfter)),
          `User should have spent ${formatEther(wethCost)}} WETH`
        ).to.equal(formatEther(wethCost));

        // I could also format BigInts here as well but it doesn't seem to matter
        // as long as units (i.e. numbers & BigInts) are kept consistent
        expect(
          poolTokenSupplyBefore.sub(poolTokenSupplyAfter),
          `Total supply of ${pool.name} should have decreased by 1`
        ).to.equal(ONE_ETHER);
      });
    });
  });
});
