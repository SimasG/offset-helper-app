import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
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
import { BigNumber } from "ethers";
import { sum as sumBN } from "../utils/bignumber";

const ONE_ETHER = parseEther("1.0");

function parseUSDC(s: string): BigNumber {
  return parseUnits(s, 6);
}

describe("OffsetHelper", function () {
  let nct: IToucanPoolToken;
  let bct: IToucanPoolToken;
  // ** Why is token's value a function?
  let TOKEN_POOLS = [
    { name: "NCT", token: () => nct },
    { name: "BCT", token: () => bct },
  ];

  async function deployOffsetHelperFixture() {
    let offsetHelper: OffsetHelper;
    let swapper: Swapper;
    let weth: IERC20;
    let wmatic: IWETH;
    let usdc: IERC20;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;
    let addrs: SignerWithAddress[];

    // * beforeEach() logic prior
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

    // Instantiating contracts & connecting them with different signers
    bct = IToucanPoolToken__factory.connect(addresses.bct, addr2);
    nct = IToucanPoolToken__factory.connect(addresses.nct, addr2);
    usdc = IERC20__factory.connect(addresses.usdc, addr2);
    weth = IERC20__factory.connect(addresses.weth, addr2);
    wmatic = IWETH__factory.connect(addresses.wmatic, addr2);

    // * before() logic prior
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

    // Sending all but one MATIC(?) from every address to addr2
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

    return {
      offsetHelper,
      weth,
      wmatic,
      usdc,
      addr1,
      addr2,
      addrs,
      nct,
      bct,
    };
  }

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
      const { offsetHelper, addr2 } = await loadFixture(
        deployOffsetHelperFixture
      );

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

      // ** Hardhat Chai Matchers: don't think it makes sense to use them here
      const supplyAfter = await poolToken.totalSupply();
      expect(supplyBefore).to.equal(supplyAfter.add(expOffset));
    }

    TOKEN_POOLS.forEach((pool) => {
      it(`should retire 1 WETH for ${pool.name} redemption`, async function () {
        const { weth } = await loadFixture(deployOffsetHelperFixture);
        await retireFixedInToken(weth, ONE_ETHER, pool.token());
      });
      it(`should retire 100 USDC for ${pool.name} redemption`, async function () {
        const { usdc } = await loadFixture(deployOffsetHelperFixture);
        await retireFixedInToken(usdc, parseUSDC("100"), pool.token());
      });
      it(`should retire 20 WMATIC for ${pool.name} redemption`, async function () {
        const { wmatic } = await loadFixture(deployOffsetHelperFixture);
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
      const { offsetHelper, addr2 } = await loadFixture(
        deployOffsetHelperFixture
      );

      // Calculating expected # of BCT/NCT to be retired
      const expOffset = await offsetHelper.calculateExpectedPoolTokenForETH(
        fromAmount,
        poolToken.address
      );
      expect(expOffset).to.be.greaterThan(0);

      const supplyBefore = await poolToken.totalSupply();

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

      // ** Hardhat Chai Matchers: don't think it makes sense to use them here
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
      const { offsetHelper, addr2, nct } = await loadFixture(
        deployOffsetHelperFixture
      );

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

      // Calculating tx fees *for this exact tx* because
      //  1. We are swapping MATIC & 2. Are also paying gas fees in MATIC
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
      const { offsetHelper, addr2, nct } = await loadFixture(
        deployOffsetHelperFixture
      );

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

      // * Personally, using Hardhat Chai Matchers for balance changes isn't too intuitive for me
      // * I'd rather keep track of different balances manually for now.
      //   await expect(() =>
      //     offsetHelper.autoOffsetPoolToken(nct.address, 1)
      //   ).to.changeTokenBalance(nct, addr2, -1);
    });

    // 1. x WETH -> y USDC -> 1 NCT -> 1 TCO2
    // 2. x WETH -> y USDC -> 1 BCT -> 1 TCO2
    TOKEN_POOLS.forEach((pool) => {
      it.only(`should retire 1.0 TCO2 using a WETH swap and ${pool.name} redemption`, async function () {
        const { offsetHelper, addr2, weth } = await loadFixture(
          deployOffsetHelperFixture
        );

        // Setting the initial chain state
        const wethBalanceBefore = await weth.balanceOf(addr2.address);
        const poolTokenSupplyBefore = await pool.token().totalSupply();

        // Calculating the cost in WETH of retiring 1.0 TCO2
        const wethCost = await offsetHelper.calculateNeededTokenAmount(
          addresses.weth,
          pool.name === "BCT" ? addresses.bct : addresses.nct,
          ONE_ETHER
        );

        console.log("weth:", weth);

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
          `Total supply of BCT should have decreased by 1`
        ).to.equal(ONE_ETHER);
      });
    });

    // x USDC -> 1 NCT -> TCO2
    it("should retire 1.0 TCO2 using a USDC swap and NCT redemption", async function () {
      const { offsetHelper, addr2, usdc, nct } = await loadFixture(
        deployOffsetHelperFixture
      );

      // Setting initial state
      const usdcBalanceBefore = await usdc.balanceOf(addr2.address);
      const nctSupplyBefore = await nct.totalSupply();

      // Calculating USDC amount needed to retire 1 TCO2
      const usdcCost = await offsetHelper.calculateNeededTokenAmount(
        addresses.usdc,
        addresses.nct,
        ONE_ETHER
      );

      // Retiring 1 TCO2
      await (await usdc.approve(offsetHelper.address, usdcCost)).wait();
      await offsetHelper.autoOffsetExactOutToken(
        addresses.usdc,
        addresses.nct,
        ONE_ETHER
      );

      // Updating state after tx
      const usdcBalanceAfter = await usdc.balanceOf(addr2.address);
      const nctSupplyAfter = await nct.totalSupply();

      // Testing
      expect(usdcBalanceBefore).to.equal(usdcBalanceAfter.add(usdcCost));
      expect(nctSupplyBefore).to.equal(nctSupplyAfter.add(ONE_ETHER));
    });

    // x WMATIC -> y USDC -> 1 NCT -> 1 TCO2
    it("should retire 1.0 TCO2 using a WMATIC swap and NCT redemption", async function () {
      const { offsetHelper, addr2, wmatic, nct } = await loadFixture(
        deployOffsetHelperFixture
      );

      // Setting initial state
      const wmaticBalanceBefore = await wmatic.balanceOf(addr2.address);
      const nctSupplyBefore = await nct.totalSupply();

      // Calculating WMATIC amount needed to retire 1 TCO2
      const wmaticCost = await offsetHelper.calculateNeededTokenAmount(
        addresses.wmatic,
        addresses.nct,
        ONE_ETHER
      );

      // Retiring 1 TCO2
      await (await wmatic.approve(offsetHelper.address, wmaticCost)).wait();
      await offsetHelper.autoOffsetExactOutToken(
        addresses.wmatic,
        addresses.nct,
        ONE_ETHER
      );

      // Updating state after tx
      const wmaticBalanceAfter = await wmatic.balanceOf(addr2.address);
      const nctSupplyAfter = await nct.totalSupply();

      // Testing
      expect(wmaticBalanceBefore).to.equal(wmaticBalanceAfter.add(wmaticCost));
      expect(nctSupplyBefore).to.equal(nctSupplyAfter.add(ONE_ETHER));
    });
  });

  describe("#autoRedeem()", function () {
    it("Should fail because we haven't deposited NCT", async function () {
      const { offsetHelper } = await loadFixture(deployOffsetHelperFixture);

      await expect(
        offsetHelper.autoRedeem(addresses.nct, ONE_ETHER)
      ).to.be.revertedWith("Insufficient NCT/BCT balance");
    });

    TOKEN_POOLS.forEach((pool) => {
      it(`should redeem ${pool.name} from deposit`, async function () {
        const { offsetHelper, addr2 } = await loadFixture(
          deployOffsetHelperFixture
        );

        // Setting the initial chain state
        const state: {
          userPoolTokenBalance: BigNumber;
          contractPoolTokenBalance: BigNumber;
          poolTokenSupply: BigNumber;
        }[] = [];
        state.push({
          userPoolTokenBalance: await pool.token().balanceOf(addr2.address),
          contractPoolTokenBalance: await pool
            .token()
            .balanceOf(offsetHelper.address),
          poolTokenSupply: await pool.token().totalSupply(),
        });

        // Depositing 1.0 BCT/NCT into the OffsetHelper contract
        await (
          await pool.token().approve(offsetHelper.address, ONE_ETHER)
        ).wait();
        await (
          await offsetHelper.deposit(
            pool.name === "BCT" ? addresses.bct : addresses.nct,
            ONE_ETHER
          )
        ).wait();

        // Adding new state after the deposit
        state.push({
          userPoolTokenBalance: await pool.token().balanceOf(addr2.address),
          contractPoolTokenBalance: await pool
            .token()
            .balanceOf(offsetHelper.address),
          poolTokenSupply: await pool.token().totalSupply(),
        });

        // Comparing states
        expect(
          state[0].userPoolTokenBalance,
          `User should have 1 less BCT post deposit`
        ).to.equal(state[1].userPoolTokenBalance.add(ONE_ETHER));

        expect(
          state[1].contractPoolTokenBalance,
          `Contract should have 1 more BCT post deposit`
        ).to.equal(state[0].contractPoolTokenBalance.add(ONE_ETHER));

        expect(
          state[0].poolTokenSupply,
          "NCT supply should be the same post deposit"
        ).to.equal(state[0].poolTokenSupply);

        // ** Why don't we need to approve the autoRedeem?
        // Redeeming 1.0 BCT/NCT from the OffsetHelper contract for TCO2s
        await offsetHelper.autoRedeem(
          pool.name === "BCT" ? addresses.bct : addresses.nct,
          ONE_ETHER
        );

        // Adding new state after the redeem tx
        state.push({
          userPoolTokenBalance: await pool.token().balanceOf(addr2.address),
          contractPoolTokenBalance: await pool
            .token()
            .balanceOf(offsetHelper.address),
          poolTokenSupply: await pool.token().totalSupply(),
        });

        // Comparing the chain state (prior vs post redeem)
        expect(
          state[2].userPoolTokenBalance,
          `User should have the same amount of ${pool.name} post redeem`
        ).to.equal(state[2].userPoolTokenBalance);

        expect(
          state[2].contractPoolTokenBalance,
          `Contract should have 1 less ${pool.name} post redeem`
        ).to.equal(state[1].contractPoolTokenBalance.sub(ONE_ETHER));

        expect(
          state[2].poolTokenSupply,
          `${pool.name} supply should be less by 1 post redeem`
        ).to.equal(state[1].poolTokenSupply.sub(ONE_ETHER));
      });
    });
  });

  describe("#autoRetire()", function () {
    TOKEN_POOLS.forEach((pool) => {
      it(`should retire using an ${pool.name} deposit`, async function () {
        const { offsetHelper, addr2 } = await loadFixture(
          deployOffsetHelperFixture
        );

        // Setting the initial state
        const state: {
          userPoolTokenBalance: BigNumber;
          contractPoolTokenBalance: BigNumber;
          poolTokenSupply: BigNumber;
        }[] = [];

        state.push({
          userPoolTokenBalance: await pool.token().balanceOf(addr2.address),
          contractPoolTokenBalance: await pool
            .token()
            .balanceOf(offsetHelper.address),
          poolTokenSupply: await pool.token().totalSupply(),
        });

        // Depositing BCT/NCT into the OffsetHelper contract
        await (
          await pool.token().approve(offsetHelper.address, ONE_ETHER)
        ).wait();
        await (
          await offsetHelper.deposit(
            pool.name === "BCT" ? addresses.bct : addresses.nct,
            ONE_ETHER
          )
        ).wait();

        // Adding new state after the deposit
        state.push({
          userPoolTokenBalance: await pool.token().balanceOf(addr2.address),
          contractPoolTokenBalance: await pool
            .token()
            .balanceOf(offsetHelper.address),
          poolTokenSupply: await pool.token().totalSupply(),
        });

        // Comparing the states (before vs after deposit)
        expect(state[0].userPoolTokenBalance.sub(ONE_ETHER)).to.equal(
          state[1].userPoolTokenBalance
        );
        expect(state[0].contractPoolTokenBalance.add(ONE_ETHER)).to.equal(
          state[1].contractPoolTokenBalance
        );
        expect(state[0].poolTokenSupply).to.equal(state[1].poolTokenSupply);

        // Redeeming 1.0 BCT/NCT for 1.0 TCO2 in OffsetHelper contract
        const redeemReceipt = await (
          await offsetHelper.autoRedeem(
            pool.name === "BCT" ? addresses.bct : addresses.nct,
            ONE_ETHER
          )
        ).wait();

        // Adding new state after redemption
        state.push({
          userPoolTokenBalance: await pool.token().balanceOf(addr2.address),
          contractPoolTokenBalance: await pool
            .token()
            .balanceOf(offsetHelper.address),
          poolTokenSupply: await pool.token().totalSupply(),
        });

        // Testing states after redemption
        expect(state[1].userPoolTokenBalance).to.equal(
          state[2].userPoolTokenBalance
        );
        expect(state[1].contractPoolTokenBalance.sub(ONE_ETHER)).to.equal(
          state[2].contractPoolTokenBalance
        );
        expect(state[1].poolTokenSupply.sub(ONE_ETHER)).to.equal(
          state[2].poolTokenSupply
        );

        // Getting tco2s & amounts that were redeemed
        if (!redeemReceipt.events) throw new Error("No events emitted");

        // Getting the arguments of the last redeemed event
        const tco2s =
          redeemReceipt.events[redeemReceipt.events.length - 1].args?.tco2s;
        const amounts =
          redeemReceipt.events[redeemReceipt.events.length - 1].args?.amounts;

        await offsetHelper.autoRetire(tco2s, amounts);

        // Adding new state after retirement
        state.push({
          userPoolTokenBalance: await pool.token().balanceOf(addr2.address),
          contractPoolTokenBalance: await pool
            .token()
            .balanceOf(offsetHelper.address),
          poolTokenSupply: await pool.token().totalSupply(),
        });

        // Testing the states (before vs after retirement)
        expect(state[2].userPoolTokenBalance).to.equal(
          state[3].userPoolTokenBalance
        );
        expect(state[2].contractPoolTokenBalance).to.equal(
          state[3].contractPoolTokenBalance
        );
        expect(state[2].poolTokenSupply).to.equal(state[3].poolTokenSupply);
      });
    });

    it("Should fail because we haven't redeemed any TCO2", async function () {
      const { offsetHelper } = await loadFixture(deployOffsetHelperFixture);

      await expect(
        offsetHelper.autoRetire(
          ["0xb139C4cC9D20A3618E9a2268D73Eff18C496B991"],
          [ONE_ETHER]
        )
      ).to.be.revertedWith("Insufficient TCO2 balance");
    });
  });

  describe("#deposit() and #withdraw()", function () {
    TOKEN_POOLS.forEach((pool) => {
      it(`Should deposit 1.0 ${pool.name}`, async function () {
        const { offsetHelper, addr2 } = await loadFixture(
          deployOffsetHelperFixture
        );
        await (
          await pool.token().approve(offsetHelper.address, ONE_ETHER)
        ).wait();

        await (
          await offsetHelper.deposit(
            pool.name === "BCT" ? addresses.bct : addresses.nct,
            ONE_ETHER
          )
        ).wait();

        await expect(
          await offsetHelper.balances(
            addr2.address,
            pool.name === "BCT" ? addresses.bct : addresses.nct
          )
        ).to.equal(ONE_ETHER);
      });
    });

    it("Should fail to deposit because we have no NCT", async function () {
      const { offsetHelper, addrs } = await loadFixture(
        deployOffsetHelperFixture
      );

      // Connect a different account with the NCT token contract
      // (one that doesn't have any NCT inside)
      await (
        await nct.connect(addrs[0]).approve(offsetHelper.address, ONE_ETHER)
      ).wait();

      // Try to deposit NCT to OffsetHelper contract
      await expect(
        offsetHelper.connect(addrs[0]).deposit(nct.address, ONE_ETHER)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Should deposit and withdraw 1.0 NCT", async function () {
      const { offsetHelper, addr2, nct } = await loadFixture(
        deployOffsetHelperFixture
      );

      // Getting initial account NCT balance
      const preDepositNCTBalance = await nct.balanceOf(addr2.address);

      // Approving, depositing & withdrawing 1.0 NCT
      await (await nct.approve(offsetHelper.address, ONE_ETHER)).wait();
      await (await offsetHelper.deposit(addresses.nct, ONE_ETHER)).wait();
      await (await offsetHelper.withdraw(addresses.nct, ONE_ETHER)).wait();

      // Getting account NCT balance after deposit
      const postWithdrawalNCTBalance = await nct.balanceOf(addr2.address);

      // Testing
      expect(preDepositNCTBalance).to.equal(postWithdrawalNCTBalance);
    });

    it("Should fail to withdraw because we haven't deposited enough NCT", async function () {
      const { offsetHelper, nct } = await loadFixture(
        deployOffsetHelperFixture
      );

      // Approving, depositing 1.0 NCT
      await (await nct.approve(offsetHelper.address, ONE_ETHER)).wait();
      await (await offsetHelper.deposit(addresses.nct, ONE_ETHER)).wait();

      // Testing withdrawal
      await expect(
        offsetHelper.withdraw(addresses.nct, parseEther("2.0"))
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("#swapExactOut{ETH,Token}() for NCT", function () {
    TOKEN_POOLS.forEach((pool) => {
      it(`Should swap WETH for 1.0 ${pool.name}`, async function () {
        const { offsetHelper, weth, addr2 } = await loadFixture(
          deployOffsetHelperFixture
        );

        // Getting pool token balance in OffsetHelper contract
        const initialBalance = await pool
          .token()
          .balanceOf(offsetHelper.address);

        // Approving & calculating how much WETH to deposit
        await (
          await weth.approve(
            offsetHelper.address,
            await offsetHelper.calculateNeededTokenAmount(
              addresses.weth,
              pool.name === "BCT" ? addresses.bct : addresses.nct,
              ONE_ETHER
            )
          )
        ).wait();

        // Swapping
        await (
          await offsetHelper.swapExactOutToken(
            addresses.weth,
            pool.name === "BCT" ? addresses.bct : addresses.nct,
            ONE_ETHER
          )
        ).wait();

        // Getting OffsetHelper BCT/NCT balance after swap
        const balanceAfterSwap = await pool
          .token()
          .balanceOf(offsetHelper.address);

        // Testing
        // Expect the offsetHelper will have 1 extra BCT/NCT in its balance
        expect(balanceAfterSwap.sub(initialBalance)).to.equal(ONE_ETHER);
        // Expect that the user should have his in-contract balance for BCT/NCT to be 1.0
        expect(
          await offsetHelper.balances(
            addr2.address,
            pool.name === "BCT" ? addresses.bct : addresses.nct
          )
        ).to.equal(ONE_ETHER);
      });
    });

    it("Should swap MATIC for 1.0 NCT", async function () {
      const { offsetHelper, addr2 } = await loadFixture(
        deployOffsetHelperFixture
      );

      // Declaring initial NCT balance of the user in the OffsetHelper contract
      const nctBalanceBefore = await offsetHelper.balances(
        addr2.address,
        addresses.nct
      );

      // Calculating how much MATIC to deposit
      const maticToSend = await offsetHelper.calculateNeededETHAmount(
        addresses.nct,
        ONE_ETHER
      );

      // ** Why do we not need to approve the tx with a native token?
      await (
        await offsetHelper.swapExactOutETH(addresses.nct, ONE_ETHER, {
          value: maticToSend,
        })
      ).wait();

      // Finding NCT balance of the user in the OffsetHelper contract after the swap
      const nctBalanceAfter = await offsetHelper.balances(
        addr2.address,
        addresses.nct
      );

      // Testing
      expect(nctBalanceAfter.sub(nctBalanceBefore)).to.equal(ONE_ETHER);
    });

    // ** Don't understand this test
    it("Should send surplus MATIC to user", async function () {
      const { offsetHelper } = await loadFixture(deployOffsetHelperFixture);

      // ** Don't understand `offsetHelper.provider`
      const preSwapETHBalance = await offsetHelper.provider.getBalance(
        offsetHelper.address
      );

      // Depositing MATIC to deposit
      const maticToSend = await offsetHelper.calculateNeededETHAmount(
        addresses.nct,
        ONE_ETHER
      );

      // ** Why do we not need to approve the tx with a native token?
      await (
        await offsetHelper.swapExactOutETH(addresses.nct, ONE_ETHER, {
          value: maticToSend.add(parseEther("0.5")),
        })
      ).wait();

      const postSwapETHBalance = await offsetHelper.provider.getBalance(
        offsetHelper.address
      );

      expect(formatEther(preSwapETHBalance)).to.be.eql(
        formatEther(postSwapETHBalance)
      );
    });

    it("Should fail since we have no WETH", async function () {
      const { offsetHelper, weth, addrs } = await loadFixture(
        deployOffsetHelperFixture
      );

      // Connecting weth contract with an account that has no WETH
      await (
        await weth.connect(addrs[0]).approve(offsetHelper.address, ONE_ETHER)
      ).wait();

      await expect(
        offsetHelper
          .connect(addrs[0])
          .swapExactOutToken(addresses.weth, addresses.nct, ONE_ETHER)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });
});
