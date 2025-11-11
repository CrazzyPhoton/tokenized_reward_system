// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {RewardToken} from "./RewardToken.sol";
import {Test} from "forge-std/Test.sol";

/// @title RewardTokenTest
/// @notice Full coverage test contract for RewardToken contract with full coverage
contract RewardTokenTest is Test {
    RewardToken public rewardToken;

    address public owner;
    address public user1;
    address public user2;

    uint256 public constant INITIAL_SUPPLY = 1000000 * 10 ** 18;
    uint256 public constant REWARD_AMOUNT = 1000 * 10 ** 18;

    // Events to test
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    event Transfer(address indexed from, address indexed to, uint256 value);

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        rewardToken = new RewardToken();
    }

    // DEPLOYMENT TESTS //

    function testDeployment() public view {
        assertEq(rewardToken.name(), "Phillip Reward Token");
        assertEq(rewardToken.symbol(), "PRT");
        assertEq(rewardToken.decimals(), 18);
    }

    function testInitialSupply() public view {
        assertEq(rewardToken.totalSupply(), INITIAL_SUPPLY);
    }

    function testOwnerGetsInitialSupply() public view {
        assertEq(rewardToken.balanceOf(owner), INITIAL_SUPPLY);
    }

    function testOwnerIsDeployer() public view {
        assertEq(rewardToken.owner(), owner);
    }

    // REWARD USER TESTS //

    function testRewardUser() public {
        uint256 ownerBalanceBefore = rewardToken.balanceOf(owner);
        uint256 user1BalanceBefore = rewardToken.balanceOf(user1);

        vm.expectEmit(true, true, false, true);
        emit Transfer(owner, user1, REWARD_AMOUNT);

        rewardToken.rewardUser(user1, REWARD_AMOUNT);

        assertEq(
            rewardToken.balanceOf(owner),
            ownerBalanceBefore - REWARD_AMOUNT
        );
        assertEq(
            rewardToken.balanceOf(user1),
            user1BalanceBefore + REWARD_AMOUNT
        );
    }

    function testRewardUserMultipleTimes() public {
        rewardToken.rewardUser(user1, REWARD_AMOUNT);
        rewardToken.rewardUser(user1, REWARD_AMOUNT);

        assertEq(rewardToken.balanceOf(user1), REWARD_AMOUNT * 2);
    }

    function testRewardMultipleUsers() public {
        rewardToken.rewardUser(user1, REWARD_AMOUNT);
        rewardToken.rewardUser(user2, REWARD_AMOUNT);

        assertEq(rewardToken.balanceOf(user1), REWARD_AMOUNT);
        assertEq(rewardToken.balanceOf(user2), REWARD_AMOUNT);
    }

    function testRewardUserWithZeroAmount() public {
        vm.expectEmit(true, true, false, true);
        emit Transfer(owner, user1, 0);

        rewardToken.rewardUser(user1, 0);

        assertEq(rewardToken.balanceOf(user1), 0);
    }

    function testRevertRewardUserWhenNotOwner() public {
        vm.prank(user1);
        vm.expectRevert("Caller is not the contract owner");
        rewardToken.rewardUser(user2, REWARD_AMOUNT);
    }

    function testRevertRewardUserInsufficientBalance() public {
        vm.expectRevert();
        rewardToken.rewardUser(user1, INITIAL_SUPPLY + 1);
    }

    // TRANSFER OWNERSHIP TESTS //

    function testTransferOwnership() public {
        vm.expectEmit(true, true, false, true);
        emit OwnershipTransferred(owner, user1);

        rewardToken.transferOwnership(user1);

        assertEq(rewardToken.owner(), user1);
    }

    function testTransferOwnershipTransfersAllTokens() public {
        uint256 ownerBalance = rewardToken.balanceOf(owner);

        rewardToken.transferOwnership(user1);

        assertEq(rewardToken.balanceOf(user1), ownerBalance);
        assertEq(rewardToken.balanceOf(owner), 0);
    }

    function testNewOwnerCanRewardUsers() public {
        rewardToken.transferOwnership(user1);

        vm.prank(user1);
        rewardToken.rewardUser(user2, REWARD_AMOUNT);

        assertEq(rewardToken.balanceOf(user2), REWARD_AMOUNT);
    }

    function testOldOwnerCannotRewardAfterTransfer() public {
        rewardToken.transferOwnership(user1);

        vm.expectRevert("Caller is not the contract owner");
        rewardToken.rewardUser(user2, REWARD_AMOUNT);
    }

    function testTransferOwnershipMultipleTimes() public {
        rewardToken.transferOwnership(user1);
        assertEq(rewardToken.owner(), user1);

        vm.prank(user1);
        rewardToken.transferOwnership(user2);
        assertEq(rewardToken.owner(), user2);
    }

    function testRevertTransferOwnershipToZeroAddress() public {
        vm.expectRevert("New contract owner cannot be zero address");
        rewardToken.transferOwnership(address(0));
    }

    function testRevertTransferOwnershipWhenNotOwner() public {
        vm.prank(user1);
        vm.expectRevert("Caller is not the contract owner");
        rewardToken.transferOwnership(user2);
    }

    // ERC20 FUNCTIONALITY TESTS //

    function testTransfer() public {
        rewardToken.transfer(user1, REWARD_AMOUNT);

        assertEq(rewardToken.balanceOf(user1), REWARD_AMOUNT);
        assertEq(rewardToken.balanceOf(owner), INITIAL_SUPPLY - REWARD_AMOUNT);
    }

    function testApproveAndTransferFrom() public {
        rewardToken.approve(user1, REWARD_AMOUNT);

        vm.prank(user1);
        rewardToken.transferFrom(owner, user2, REWARD_AMOUNT);

        assertEq(rewardToken.balanceOf(user2), REWARD_AMOUNT);
        assertEq(rewardToken.allowance(owner, user1), 0);
    }

    // FUZZ TESTS //

    function testFuzzRewardUser(address user, uint256 amount) public {
        vm.assume(user != address(0));
        vm.assume(amount > 0 && amount <= INITIAL_SUPPLY);

        rewardToken.rewardUser(user, amount);

        assertEq(rewardToken.balanceOf(user), amount);
    }

    function testFuzzTransferOwnership(address newOwner) public {
        vm.assume(newOwner != address(0));

        rewardToken.transferOwnership(newOwner);

        assertEq(rewardToken.owner(), newOwner);
    }

    function testFuzzRewardUserRevertsWhenNotOwner(
        address caller,
        address user,
        uint256 amount
    ) public {
        vm.assume(caller != owner);
        vm.assume(caller != address(0));
        vm.assume(user != address(0));
        vm.assume(amount > 0 && amount <= INITIAL_SUPPLY);

        vm.prank(caller);
        vm.expectRevert("Caller is not the contract owner");
        rewardToken.rewardUser(user, amount);
    }
}
