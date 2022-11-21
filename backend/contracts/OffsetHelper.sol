// SPDX-FileCopyrightText: 2022 Toucan Labs
//
// SPDX-License-Identifier: GPL-3.0

import "./OffsetHelperStorage.sol";
// ** Why `SafeERC20.sol`?
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// ** How are we using interfaces instead of the actual contracts without ABIs?
import "./interfaces/IToucanContractRegistry.sol";
// ** Why do we need to instantiate a pool token in this contract?
import "./interfaces/IToucanPoolToken.sol";
import "./interfaces/IToucanCarbonOffsets.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

/**
 * @title Toucan Protocol Offset Helpers
 * @notice Helper functions that simplify the carbon offsetting (retirement)
 * process.
 *
 * Retiring carbon tokens requires multiple steps and interactions with
 * Toucan Protocol's main contracts:
 * 1. Obtain a Toucan pool token such as BCT or NCT (by performing a token
 *    swap).
 * 2. Redeem the pool token for a TCO2 token.
 * 3. Retire the TCO2 token.
 *
 * These steps are combined in each of the following "auto offset" methods
 * implemented in `OffsetHelper` to allow a retirement within one transaction:
 * - `autoOffsetPoolToken()` if the user already owns a Toucan pool
 *   token such as BCT or NCT,
 * - `autoOffsetExactOutETH()` if the user would like to perform a retirement
 *   using MATIC, specifying the exact amount of TCO2s to retire,
 * - `autoOffsetExactInETH()` if the user would like to perform a retirement
 *   using MATIC, swapping all sent MATIC into TCO2s,
 * - `autoOffsetExactOutToken()` if the user would like to perform a retirement
 *   using an ERC20 token (USDC, WETH or WMATIC), specifying the exact amount
 *   of TCO2s to retire,
 * - `autoOffsetExactInToken()` if the user would like to perform a retirement
 *   using an ERC20 token (USDC, WETH or WMATIC), specifying the exact amount
 *   of token to swap into TCO2s.
 *
 * In these methods, "auto" refers to the fact that these methods use
 * `autoRedeem()` in order to automatically choose a TCO2 token corresponding
 * to the oldest tokenized carbon project in the specfified token pool.
 * There are no fees incurred by the user when using `autoRedeem()`, i.e., the
 * user receives 1 TCO2 token for each pool token (BCT/NCT) redeemed.
 *
 * There are two `view` helper functions `calculateNeededETHAmount()` and
 * `calculateNeededTokenAmount()` that should be called before using
 * `autoOffsetExactOutETH()` and `autoOffsetExactOutToken()`, to determine how
 * much MATIC, respectively how much of the ERC20 token must be sent to the
 * `OffsetHelper` contract in order to retire the specified amount of carbon.
 *
 * The two `view` helper functions `calculateExpectedPoolTokenForETH()` and
 * `calculateExpectedPoolTokenForToken()` can be used to calculate the
 * expected amount of TCO2s that will be offset using functions
 * `autoOffsetExactInETH()` and `autoOffsetExactInToken()`.
 */
contract OffsetHelper is OffsetHelperStorage {
    using SafeERC20 for IERC20;

    /**
     * @notice Contract constructor. Should specify arrays of ERC20 symbols and
     * addresses that can used by the contract.
     *
     * @dev See `isEligible()` for a list of tokens that can be used in the
     * contract. These can be modified after deployment by the contract owner
     * using `setEligibleTokenAddress()` and `deleteEligibleTokenAddress()`.
     *
     * @param _eligibleTokenSymbols A list of token symbols.
     * @param _eligibleTokenAddresses A list of token addresses corresponding
     * to the provided token symbols.
     */
    constructor(
        string[] memory _eligibleTokenSymbols,
        address[] memory _eligibleTokenAddresses
    ) {
        uint256 i = 0;
        uint256 eligibleTokenSymbolsLen = _eligibleTokenSymbols.length;

        // Connecting _eligibleTokenSymbols with _eligibleTokenAddresses
        // ** Is it possible to avoid the while loop?
        while (i < eligibleTokenSymbolsLen) {
            // ** How are we able to create `eligibleTokenAddresses` var here?
            eligibleTokenAddresses[
                _eligibleTokenSymbols[i]
            ] = _eligibleTokenAddresses[i];
            i += 1;
        }
    }

    /**
     * @notice Emitted upon successful redemption of TCO2 tokens from a Toucan
     * pool token such as BCT or NCT.
     *
     * @param who The sender of the transaction
     * @param poolToken The address of the Toucan pool token used in the
     * redemption, for example, NCT or BCT
     * @param tco2s An array of the TCO2 addresses that were redeemed
     * @param amounts An array of the amounts of each TCO2 that were redeemed
     */
    event Redeemed(
        address who,
        address poolToken,
        address[] tco2s,
        uint256[] amounts
    );

    modifier onlyRedeemable(address _token) {
        require(isRedeemable(_token), "Token not redeemable");
        _;
    }

    modifier onlySwappable(address _token) {
        require(isSwappable(_token), "Token not swappable");
        _;
    }

    /**
     * @notice Checks whether an address is a Toucan pool token address
     * @param _erc20Address address of token to be checked
     * @return True if the address is a Toucan pool token address
     */
    function isRedeemable(address _erc20Address) private view returns (bool) {
        if (_erc20Address == eligibleTokenAddresses["BCT"]) return true;
        if (_erc20Address == eligibleTokenAddresses["NCT"]) return true;
        return false;
    }

    /**
     * @notice Checks whether an address can be used in a token swap
     * @param _erc20Address address of token to be checked
     * @return True if the specified address can be used in a swap
     */
    function isSwappable(address _erc20Address) private view returns (bool) {
        if (_erc20Address == eligibleTokenAddresses["USDC"]) return true;
        if (_erc20Address == eligibleTokenAddresses["WETH"]) return true;
        if (_erc20Address == eligibleTokenAddresses["WMATIC"]) return true;
        return false;
    }

    /**
     * @notice Retire carbon credits using the lowest quality (oldest) TCO2
     * tokens available from the specified Toucan token pool by sending ERC20
     * tokens (USDC, WETH, WMATIC). Use `calculateNeededTokenAmount` first in
     * order to find out how much of the ERC20 token is required to retire the
     * specified quantity of TCO2.
     *
     * This function:
     * 1. Swaps the ERC20 token sent to the contract for the specified pool token.
     * 2. Redeems the pool token for the poorest quality TCO2 tokens available.
     * 3. Retires the TCO2 tokens.
     *
     * Note: The client must approve the ERC20 token that is sent to the contract.
     *
     * @dev When automatically redeeming pool tokens for the lowest quality
     * TCO2s there are no fees and you receive exactly 1 TCO2 token for 1 pool
     * token.
     *
     * @param _depositedToken The address of the ERC20 token that the user sends
     * (must be one of USDC, WETH, WMATIC)
     * @param _poolToken The address of the Toucan pool token that the
     * user wants to use, for example, NCT or BCT
     * @param _amountToOffset The amount of TCO2 to offset
     *
     * @return tco2s An array of the TCO2 addresses that were redeemed
     * @return amounts An array of the amounts of each TCO2 that were redeemed
     */
    function autoOffsetExactOutToken(
        address _depositedToken,
        address _poolToken,
        uint256 _amountToOffset
    ) public returns (address[] memory tco2s, uint256[] memory amounts) {
        // swap input token for BCT / NCT
        swapExactOutToken(_depositedToken, _poolToken, _amountToOffset);

        // redeem BCT / NCT for TCO2s
        (tco2s, amounts) = autoRedeem(_poolToken, _amountToOffset);

        // retire the TCO2s to achieve offset
        autoRetire(tco2s, amounts);
    }

    /* ------------------------------------------ */
    /* `autoOffsetExactOutToken` helper functions */
    /* ------------------------------------------ */

    /* `swapExactOutToken` helper functions */

    /**
     * @notice Swap eligible ERC20 tokens for Toucan pool tokens (BCT/NCT) on SushiSwap
     * @dev Needs to be approved on the client side
     * @param _fromToken The ERC20 oken to deposit and swap
     * @param _toToken The token to swap for (will be held within contract)
     * @param _toAmount The required amount of the Toucan pool token (NCT/BCT)
     */
    function swapExactOutToken(
        address _fromToken,
        address _toToken,
        uint256 _toAmount
    ) public onlySwappable(_fromToken) onlyRedeemable(_toToken) {
        // calculate path & amounts
        // ** Could we replace `memory` with `calldata`?
        (
            address[] memory path,
            uint256[] memory expAmounts
        ) = calculateExactOutSwap(_fromToken, _toToken, _toAmount);
        uint256 amountIn = expAmounts[0];

        // transfer tokens
        IERC20(_fromToken).safeTransferFrom(
            msg.sender,
            address(this),
            amountIn
        );

        // approve router
        // ** `IERC20` here is actually `safeERC20`, right? Since `using SafeERC20 for IERC20`
        IERC20(_fromToken).approve(sushiRouterAddress, amountIn);

        // swap
        // ** How does `block.timestamp` work here? Does it mean that the transaction must
        // ** happen in the current block?
        uint256[] memory amounts = routerSushi().swapTokensForExactTokens(
            _toAmount,
            amountIn,
            path,
            address(this),
            block.timestamp
        );

        // remove remaining approval if less input token was consumed
        // ** Don't understand this
        if (amounts[0] < amountIn) {
            IERC20(_fromToken).approve(sushiRouterAddress, 0);
        }

        // update balances
        balances[msg.sender][_toToken] += _toAmount;
    }

    // ** Why not `private`?
    function calculateExactOutSwap(
        address _fromToken,
        address _toToken,
        uint256 _toAmount
    ) internal view returns (address[] memory path, uint256[] memory amounts) {
        path = generatePath(_fromToken, _toToken);
        uint256 len = path.length;

        // ** What does `getAmountsIn()` do exactly?
        amounts = routerSushi().getAmountsIn(_toAmount, path);

        // sanity check arrays
        require(len == amounts.length, "Arrays unequal");
        require(_toAmount == amounts[len - 1], "Output amount mismatch");
    }

    // ** Why not `private`?
    function generatePath(address _fromToken, address _toToken)
        internal
        view
        returns (address[] memory)
    {
        if (_fromToken == eligibleTokenAddresses["USDC"]) {
            address[] memory path = new address[](2);
            path[0] = _fromToken;
            path[1] = _toToken;
            return path;
        } else {
            address[] memory path = new address[](3);
            path[0] = _fromToken;
            path[1] = eligibleTokenAddresses["USDC"];
            path[2] = _toToken;
            return path;
        }
    }

    // ** Why not `private`?
    function routerSushi() internal view returns (IUniswapV2Router02) {
        // ** Don't understand the significance of this line
        return IUniswapV2Router02(sushiRouterAddress);
    }

    /* `autoRedeem` helper functions */
    /**
     * @notice Redeems the specified amount of NCT / BCT for TCO2.
     * @dev Needs to be approved on the client side
     * @param _fromToken Could be the address of NCT or BCT
     * @param _amount Amount to redeem
     * @return tco2s An array of the TCO2 addresses that were redeemed
     * @return amounts An array of the amounts of each TCO2 that were redeemed
     */
}
