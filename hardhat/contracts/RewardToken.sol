// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title RewardToken (Phillip Reward Token).
/// @notice ERC20 token used for rewarding users in the system.
/// @dev Inherits from OpenZeppelin's ERC20 implementation.
contract RewardToken is ERC20 {

    // STATE VARIABLES //

    /// @notice Owner of the contract.
    address public owner;

    // EVENTS //

    /// @dev Event emitted when contract ownership is transferred.
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // CONSTRUCTOR //

    /// @dev Constructor that mints total supply to the deployer.
    constructor() ERC20("Phillip Reward Token", "PRT") {
        owner = msg.sender;
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    // MODIFIERS //

    /// @dev Modifier to restrict functions to the contract owner.
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the contract owner");
        _;
    }

    // FUNCTIONS //

    /// @notice Rewards a user with tokens.
    /// @dev Only the contract owner can call this function.
    /// @param user The address of the user to reward.
    /// @param amount The amount of tokens to reward.
    function rewardUser(address user, uint256 amount) external onlyOwner {
        _transfer(msg.sender, user, amount);
    }

    /// @notice Transfers contract ownership and contract owner's token balance to the new contract owner.
    /// @dev Only the current contract owner can call this function.
    /// @param newOwner The address of the new contract owner.
    function transferOwnership(address newOwner) external onlyOwner {
        require(
            newOwner != address(0),
            "New contract owner cannot be zero address"
        );
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
        _transfer(previousOwner, newOwner, balanceOf(previousOwner));
    }
}
