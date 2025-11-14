"use client";
import { useState, useEffect } from "react";
import { isAddress } from "ethers";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { contract } from "../utils/contract";
import { formatUnits } from "viem";
import { sepolia } from "wagmi/chains";
import Link from "next/link";

export default function Home() {
  const account = useAccount();

  const accountPRTBalanceInWei = useReadContract({
    address: contract.address as `0x${string}`,
    abi: contract.abi,
    functionName: "balanceOf",
    args: account.isConnected ? [account.address as `0x${string}`] : undefined,
    chainId: sepolia.id,
  });

  const contractOwner = useReadContract({
    address: contract.address as `0x${string}`,
    abi: contract.abi,
    functionName: "owner",
    chainId: sepolia.id,
  });

  const blockInvalidChar = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  // REWARD FUNCTIONALITY //

  const sendReward = useWriteContract();

  const [rewardAddress, setRewardAddress] = useState<string>("");
  const [rewardAmount, setRewardAmount] = useState<string>("");
  const [incorrectAddressError, setIncorrectAddressError] =
    useState<string>("");
  const [incorrectAmountError, setIncorrectAmountError] = useState<string>("");
  const [rewardTxHash, setRewardTxHash] = useState<string>("");

  const handleRewardAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputAddress = e.target.value;
    setRewardAddress(inputAddress);

    if (inputAddress && !isAddress(inputAddress)) {
      setIncorrectAddressError("Invalid wallet address!");
    } else {
      setIncorrectAddressError("");
    }
  };

  const handleRewardAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputAmount = e.target.value;
    setRewardAmount(inputAmount);

    const accountPRTBalance = accountPRTBalanceInWei.data
      ? Number(formatUnits(accountPRTBalanceInWei.data as bigint, 18))
      : 0;

    const MIN_TOKEN_AMOUNT = 0.000000000000000001; // 1 wei = 10^-18

    if (inputAmount === "") {
      setIncorrectAmountError("");
    } else if (Number(inputAmount) <= 0) {
      setIncorrectAmountError("Invalid amount!");
    } else if (Number(inputAmount) < MIN_TOKEN_AMOUNT) {
      setIncorrectAmountError("Amount must be at least 1 wei!");
    } else if (Number(inputAmount) > accountPRTBalance) {
      setIncorrectAmountError("Amount exceeds your PRT token balance!");
    } else {
      setIncorrectAmountError("");
    }
  };

  const handleSendReward = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const sendRewardTxHash = await sendReward.writeContractAsync({
        address: contract.address as `0x${string}`,
        abi: contract.abi,
        functionName: "rewardUser",
        args: [rewardAddress, Number(rewardAmount) * 10 ** 18],
      });
      setRewardTxHash(sendRewardTxHash);
    } catch (error) {
      console.log("Error sending reward:", error);
    }
  };

  const waitForSendRewardTx = useWaitForTransactionReceipt({
    hash: rewardTxHash as `0x${string}`,
    query: { enabled: Boolean(rewardTxHash) },
  });

  useEffect(() => {
    if (waitForSendRewardTx.isSuccess) {
      accountPRTBalanceInWei.refetch();
    }
  }, [waitForSendRewardTx.isSuccess, accountPRTBalanceInWei]);

  // TRANSFER TOKENS FUNCTIONALITY //

  const transferTokens = useWriteContract();

  const [transferAddress, setTransferAddress] = useState<string>("");
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [incorrectTransferAddressError, setIncorrectTransferAddressError] =
    useState<string>("");
  const [incorrectTransferAmountError, setIncorrectTransferAmountError] =
    useState<string>("");
  const [transferTxHash, setTransferTxHash] = useState<string>("");

  const handleTransferAddressChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputAddress = e.target.value;
    setTransferAddress(inputAddress);

    if (inputAddress && !isAddress(inputAddress)) {
      setIncorrectTransferAddressError("Invalid wallet address!");
    } else {
      setIncorrectTransferAddressError("");
    }
  };

  const handleTransferAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputAmount = e.target.value;
    setTransferAmount(inputAmount);

    const accountPRTBalance = accountPRTBalanceInWei.data
      ? Number(formatUnits(accountPRTBalanceInWei.data as bigint, 18))
      : 0;

    const MIN_TOKEN_AMOUNT = 0.000000000000000001; // 1 wei = 10^-18

    if (inputAmount === "") {
      setIncorrectTransferAmountError("");
    } else if (Number(inputAmount) <= 0) {
      setIncorrectTransferAmountError("Invalid amount!");
    } else if (Number(inputAmount) < MIN_TOKEN_AMOUNT) {
      setIncorrectTransferAmountError("Amount must be at least 1 wei!");
    } else if (Number(inputAmount) > accountPRTBalance) {
      setIncorrectTransferAmountError("Amount exceeds your PRT token balance!");
    } else {
      setIncorrectTransferAmountError("");
    }
  };

  const handleTransferTokens = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const transferTokensTxHash = await transferTokens.writeContractAsync({
        address: contract.address as `0x${string}`,
        abi: contract.abi,
        functionName: "transfer",
        args: [transferAddress, Number(transferAmount) * 10 ** 18],
      });
      setTransferTxHash(transferTokensTxHash);
    } catch (error) {
      console.log("Error transferring tokens:", error);
    }
  };

  const waitForTransferTokensTx = useWaitForTransactionReceipt({
    hash: transferTxHash as `0x${string}`,
    query: { enabled: Boolean(transferTxHash) },
  });

  useEffect(() => {
    if (waitForTransferTokensTx.isSuccess) {
      accountPRTBalanceInWei.refetch();
    }
  }, [waitForTransferTokensTx.isSuccess, accountPRTBalanceInWei]);

  return (
    <>
      {account.isDisconnected || account.isConnecting ? (
        <>
          <div className="hidden md:flex flex-col h-dvh max-h-[calc(100dvh-(var(--spacing)*20))] items-center gap-7 w-full justify-center px-6">
            <h1 className="text-6xl text-center font-bold">
              Reward & transfer PRT tokens to users
            </h1>
            <span className="text-2xl text-center font-mono">
              Please connect your wallet to continue
            </span>
          </div>

          <div className="flex flex-col h-dvh max-h-[calc(100dvh-(var(--spacing)*20))] items-center gap-7 w-full justify-center px-5 md:hidden">
            <h1 className="text-3xl text-center font-bold">
              Reward & transfer PRT tokens to users
            </h1>
            <span className="text-base text-center font-mono">
              Please connect your wallet to continue
            </span>
          </div>
        </>
      ) : (
        <div className="">
          <div className="flex flex-col h-dvh max-h-[calc(100dvh-(var(--spacing)*20))] justify-start items-center w-full px-10 py-10 gap-14">
            {/* XL Screen */}
            <div className="hidden xl:flex gap-5">
              <span className="text-xl font-mono">
                Connected Address{" "}
                {account.address !== contractOwner.data
                  ? "(User)"
                  : "(Contract Owner)"}
                : {account.address}{" "}
              </span>
              <span className="text-xl font-mono">|</span>
              <span className="text-xl font-mono">
                Token Balance:{" "}
                {accountPRTBalanceInWei.data
                  ? formatUnits(accountPRTBalanceInWei.data as bigint, 18)
                  : "0"}{" "}
                PRT
              </span>
            </div>

            {/* MD AND LG Screen */}
            <div className="hidden md:flex flex-col items-center gap-10 xl:hidden">
              <span className="text-xl text-center font-mono">
                Connected Address{" "}
                {account.address !== contractOwner.data
                  ? "(User)"
                  : "(Contract Owner)"}
                : {account.address}{" "}
              </span>
              <span className="text-xl font-mono">
                Token Balance:{" "}
                {accountPRTBalanceInWei.data
                  ? formatUnits(accountPRTBalanceInWei.data as bigint, 18)
                  : "0"}{" "}
                PRT
              </span>
            </div>

            {/* Below MD Screens */}
            <div className="flex flex-col items-center gap-10 md:hidden">
              <span className="text-lg wrap-anywhere text-center font-mono">
                Connected Address{" "}
                {account.address !== contractOwner.data
                  ? "(User)"
                  : "(Contract Owner)"}
                : {account.address}{" "}
              </span>
              <span className="text-lg text-center font-mono">
                Token Balance:{" "}
                {accountPRTBalanceInWei.data
                  ? formatUnits(accountPRTBalanceInWei.data as bigint, 18)
                  : "0"}{" "}
                PRT
              </span>
            </div>

            {/* FOR XL AND GREATER SCREENS */}
            <div className="hidden xl:flex items-start justify-between w-full px-32 h-full gap-14">
              {/* REWARD TOKENS UI */}
              <form
                onSubmit={handleSendReward}
                className="flex flex-col gap-3 items-center justify-start py-10 px-8 rounded-3xl border-3 w-lg"
              >
                <span className="text-3xl font-bold">
                  Reward User PRT Tokens
                </span>
                <span className="text-base text-gray-500 font-mono">
                  {"(For Contract Owner)"}
                </span>
                <div className="flex flex-col w-full gap-2 items-start justify-center">
                  <label htmlFor="reward-address" className="text-lg font-mono">
                    Wallet address
                  </label>
                  <input
                    type="text"
                    placeholder="Enter wallet address to reward"
                    className="w-full p-3 font-mono rounded-lg hover:rounded-3xl transition-all duration-300 border-2 focus:outline-none placeholder:text-gray-400 placeholder:font-mono"
                    value={rewardAddress}
                    onChange={handleRewardAddressChange}
                    disabled={
                      sendReward.isPending || waitForSendRewardTx.isLoading
                    }
                    required
                  />
                  <span className="text-red-500 font-mono">
                    {incorrectAddressError}
                  </span>
                </div>
                <div className="flex flex-col w-full gap-2 items-start justify-center">
                  <label htmlFor="reward-amount" className="text-lg font-mono">
                    Reward amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={
                      accountPRTBalanceInWei.data
                        ? formatUnits(accountPRTBalanceInWei.data as bigint, 18)
                        : "0"
                    }
                    value={rewardAmount}
                    onChange={handleRewardAmountChange}
                    onKeyDown={blockInvalidChar}
                    disabled={
                      sendReward.isPending || waitForSendRewardTx.isLoading
                    }
                    required
                    placeholder="Enter amount to reward"
                    className="w-full p-3 font-mono rounded-lg hover:rounded-3xl transition-all duration-300 border-2 focus:outline-none placeholder:text-gray-400 placeholder:font-mono"
                  />
                  <span className="text-red-500 font-mono">
                    {incorrectAmountError}
                  </span>
                </div>
                <button
                  type="submit"
                  className={`w-full p-3 mt-4 rounded-lg hover:rounded-3xl transition-all duration-300 bg-black text-white font-bold ${
                    account.address !== contractOwner.data
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={
                    account.address !== contractOwner.data ||
                    incorrectAddressError !== "" ||
                    incorrectAmountError !== "" ||
                    // rewardAddress === "" ||
                    // rewardAmount === "" ||
                    sendReward.isPending ||
                    waitForSendRewardTx.isLoading
                  }
                >
                  {sendReward.isPending || waitForSendRewardTx.isLoading
                    ? `Rewarding ${rewardAmount} PRT ...`
                    : "Reward User"}
                </button>
              </form>

              {/* TRANSFER TOKENS UI */}
              <form
                onSubmit={handleTransferTokens}
                className="flex flex-col gap-3 items-center justify-start py-10 px-8 rounded-3xl border-3 w-lg"
              >
                <span className="text-3xl font-bold">Transfer PRT Tokens</span>
                <span className="text-base text-gray-500 font-mono">
                  {"(For Users & Contract Owner)"}
                </span>
                <div className="flex flex-col w-full gap-2 items-start justify-center">
                  <label
                    htmlFor="transfer-address"
                    className="text-lg font-mono"
                  >
                    Wallet address
                  </label>
                  <input
                    type="text"
                    placeholder="Enter wallet address to transfer tokens"
                    className="w-full p-3 font-mono rounded-lg hover:rounded-3xl transition-all duration-300 border-2 focus:outline-none placeholder:text-gray-400 placeholder:font-mono"
                    value={transferAddress}
                    onChange={handleTransferAddressChange}
                    disabled={
                      transferTokens.isPending ||
                      waitForTransferTokensTx.isLoading
                    }
                    required
                  />
                  <span className="text-red-500 font-mono">
                    {incorrectTransferAddressError}
                  </span>
                </div>
                <div className="flex flex-col w-full gap-2 items-start justify-center">
                  <label
                    htmlFor="transfer-amount"
                    className="text-lg font-mono"
                  >
                    Transfer amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={
                      accountPRTBalanceInWei.data
                        ? formatUnits(accountPRTBalanceInWei.data as bigint, 18)
                        : "0"
                    }
                    value={transferAmount}
                    onChange={handleTransferAmountChange}
                    onKeyDown={blockInvalidChar}
                    disabled={
                      transferTokens.isPending ||
                      waitForTransferTokensTx.isLoading
                    }
                    required
                    placeholder="Enter amount to transfer"
                    className="w-full p-3 font-mono rounded-lg hover:rounded-3xl transition-all duration-300 border-2 focus:outline-none placeholder:text-gray-400 placeholder:font-mono"
                  />
                  <span className="text-red-500 font-mono">
                    {incorrectTransferAmountError}
                  </span>
                </div>
                <button
                  type="submit"
                  className="w-full p-3 mt-4 rounded-lg hover:rounded-3xl transition-all duration-300 bg-black text-white font-bold"
                  disabled={
                    incorrectTransferAddressError !== "" ||
                    incorrectTransferAmountError !== "" ||
                    // transferAddress === "" ||
                    // transferAmount === "" ||
                    transferTokens.isPending ||
                    waitForTransferTokensTx.isLoading
                  }
                >
                  {transferTokens.isPending || waitForTransferTokensTx.isLoading
                    ? `Transferring ${transferAmount} PRT ...`
                    : "Transfer Tokens"}
                </button>
              </form>
            </div>

            {/* FOR MD AND LG SCREENS */}
            <div className="hidden md:flex flex-col items-center w-full px-32 gap-14 xl:hidden">
              {/* REWARD TOKENS UI */}
              <form
                onSubmit={handleSendReward}
                className="flex flex-col gap-3 items-center justify-start py-10 px-8 rounded-3xl border-3 w-lg"
              >
                <span className="text-3xl font-bold">
                  Reward User PRT Tokens
                </span>
                <span className="text-base text-gray-500 font-mono">
                  {"(For Contract Owner)"}
                </span>
                <div className="flex flex-col w-full gap-2 items-start justify-center">
                  <label htmlFor="reward-address" className="text-lg font-mono">
                    Wallet address
                  </label>
                  <input
                    type="text"
                    placeholder="Enter wallet address to reward"
                    className="w-full p-3 font-mono rounded-lg hover:rounded-3xl transition-all duration-300 border-2 focus:outline-none placeholder:text-gray-400 placeholder:font-mono"
                    value={rewardAddress}
                    onChange={handleRewardAddressChange}
                    disabled={
                      sendReward.isPending || waitForSendRewardTx.isLoading
                    }
                    required
                  />
                  <span className="text-red-500 font-mono">
                    {incorrectAddressError}
                  </span>
                </div>
                <div className="flex flex-col w-full gap-2 items-start justify-center">
                  <label htmlFor="reward-amount" className="text-lg font-mono">
                    Reward amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={
                      accountPRTBalanceInWei.data
                        ? formatUnits(accountPRTBalanceInWei.data as bigint, 18)
                        : "0"
                    }
                    value={rewardAmount}
                    onChange={handleRewardAmountChange}
                    onKeyDown={blockInvalidChar}
                    disabled={
                      sendReward.isPending || waitForSendRewardTx.isLoading
                    }
                    required
                    placeholder="Enter amount to reward"
                    className="w-full p-3 font-mono rounded-lg hover:rounded-3xl transition-all duration-300 border-2 focus:outline-none placeholder:text-gray-400 placeholder:font-mono"
                  />
                  <span className="text-red-500 font-mono">
                    {incorrectAmountError}
                  </span>
                </div>
                <button
                  type="submit"
                  className={`w-full p-3 mt-4 rounded-lg hover:rounded-3xl transition-all duration-300 bg-black text-white font-bold ${
                    account.address !== contractOwner.data
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={
                    account.address !== contractOwner.data ||
                    incorrectAddressError !== "" ||
                    incorrectAmountError !== "" ||
                    // rewardAddress === "" ||
                    // rewardAmount === "" ||
                    sendReward.isPending ||
                    waitForSendRewardTx.isLoading
                  }
                >
                  {sendReward.isPending || waitForSendRewardTx.isLoading
                    ? `Rewarding ${rewardAmount} PRT ...`
                    : "Reward User"}
                </button>
              </form>

              {/* TRANSFER TOKENS UI */}
              <form
                onSubmit={handleTransferTokens}
                className="flex flex-col gap-3 items-center justify-start py-10 px-8 mb-16 rounded-3xl border-3 w-lg"
              >
                <span className="text-3xl font-bold">Transfer PRT Tokens</span>
                <span className="text-base text-gray-500 font-mono">
                  {"(For Users & Contract Owner)"}
                </span>
                <div className="flex flex-col w-full gap-2 items-start justify-center">
                  <label
                    htmlFor="transfer-address"
                    className="text-lg font-mono"
                  >
                    Wallet address
                  </label>
                  <input
                    type="text"
                    placeholder="Enter wallet address to transfer tokens"
                    className="w-full p-3 font-mono rounded-lg hover:rounded-3xl transition-all duration-300 border-2 focus:outline-none placeholder:text-gray-400 placeholder:font-mono"
                    value={transferAddress}
                    onChange={handleTransferAddressChange}
                    disabled={
                      transferTokens.isPending ||
                      waitForTransferTokensTx.isLoading
                    }
                    required
                  />
                  <span className="text-red-500 font-mono">
                    {incorrectTransferAddressError}
                  </span>
                </div>
                <div className="flex flex-col w-full gap-2 items-start justify-center">
                  <label
                    htmlFor="transfer-amount"
                    className="text-lg font-mono"
                  >
                    Transfer amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={
                      accountPRTBalanceInWei.data
                        ? formatUnits(accountPRTBalanceInWei.data as bigint, 18)
                        : "0"
                    }
                    value={transferAmount}
                    onChange={handleTransferAmountChange}
                    onKeyDown={blockInvalidChar}
                    disabled={
                      transferTokens.isPending ||
                      waitForTransferTokensTx.isLoading
                    }
                    required
                    placeholder="Enter amount to transfer"
                    className="w-full p-3 font-mono rounded-lg hover:rounded-3xl transition-all duration-300 border-2 focus:outline-none placeholder:text-gray-400 placeholder:font-mono"
                  />
                  <span className="text-red-500 font-mono">
                    {incorrectTransferAmountError}
                  </span>
                </div>
                <button
                  type="submit"
                  className="w-full p-3 mt-4 rounded-lg hover:rounded-3xl transition-all duration-300 bg-black text-white font-bold"
                  disabled={
                    incorrectTransferAddressError !== "" ||
                    incorrectTransferAmountError !== "" ||
                    // transferAddress === "" ||
                    // transferAmount === "" ||
                    transferTokens.isPending ||
                    waitForTransferTokensTx.isLoading
                  }
                >
                  {transferTokens.isPending || waitForTransferTokensTx.isLoading
                    ? `Transferring ${transferAmount} PRT ...`
                    : "Transfer Tokens"}
                </button>
              </form>
            </div>

            {/* FOR BELOW MD SCREENS */}
            <div className="flex flex-col items-center w-full px-32 gap-14 md:hidden">
              {/* REWARD TOKENS UI */}
              <form
                onSubmit={handleSendReward}
                className="flex flex-col gap-3 items-center justify-start py-10 px-8 rounded-3xl border-3 w-xs"
              >
                <span className="text-2xl text-center wrap-anywhere font-bold">
                  Reward User PRT Tokens
                </span>
                <span className="text-sm text-center wrap-anywhere text-gray-500 font-mono">
                  {"(For Contract Owner)"}
                </span>
                <div className="flex flex-col w-full gap-2 items-start justify-center">
                  <label
                    htmlFor="reward-address"
                    className="text-base wrap-anywhere font-mono"
                  >
                    Wallet address
                  </label>
                  <input
                    type="text"
                    placeholder="Enter wallet address"
                    className="w-full p-2 wrap-anywhere placeholder:wrap-anywhere font-mono rounded-lg hover:rounded-3xl transition-all duration-300 border-2 focus:outline-none placeholder:text-gray-400 placeholder:text-sm placeholder:font-mono"
                    value={rewardAddress}
                    onChange={handleRewardAddressChange}
                    disabled={
                      sendReward.isPending || waitForSendRewardTx.isLoading
                    }
                    required
                  />
                  <span className="text-red-500 wrap-anywhere text-sm font-mono">
                    {incorrectAddressError}
                  </span>
                </div>
                <div className="flex flex-col w-full gap-2 items-start justify-center">
                  <label
                    htmlFor="reward-amount"
                    className="text-base wrap-anywhere font-mono"
                  >
                    Reward amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={
                      accountPRTBalanceInWei.data
                        ? formatUnits(accountPRTBalanceInWei.data as bigint, 18)
                        : "0"
                    }
                    value={rewardAmount}
                    onChange={handleRewardAmountChange}
                    onKeyDown={blockInvalidChar}
                    disabled={
                      sendReward.isPending || waitForSendRewardTx.isLoading
                    }
                    required
                    placeholder="Enter reward amount"
                    className="w-full wrap-anywhere placeholder:wrap-anywhere p-2 font-mono rounded-lg hover:rounded-3xl transition-all duration-300 border-2 focus:outline-none placeholder:text-gray-400 placeholder:text-sm placeholder:font-mono"
                  />
                  <span className="text-red-500 wrap-anywhere text-sm font-mono">
                    {incorrectAmountError}
                  </span>
                </div>
                <button
                  type="submit"
                  className={`w-full py-3 px-2 mt-4 rounded-lg hover:rounded-3xl transition-all duration-300 bg-black text-white font-bold wrap-anywhere ${
                    account.address !== contractOwner.data
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={
                    account.address !== contractOwner.data ||
                    incorrectAddressError !== "" ||
                    incorrectAmountError !== "" ||
                    // rewardAddress === "" ||
                    // rewardAmount === "" ||
                    sendReward.isPending ||
                    waitForSendRewardTx.isLoading
                  }
                >
                  {sendReward.isPending || waitForSendRewardTx.isLoading
                    ? `Rewarding ${rewardAmount} PRT ...`
                    : "Reward User"}
                </button>
              </form>

              {/* TRANSFER TOKENS UI */}
              <form
                onSubmit={handleTransferTokens}
                className="flex flex-col gap-3 items-center justify-start py-10 px-8 mb-16 rounded-3xl border-3 w-xs"
              >
                <span className="text-2xl text-center wrap-anywhere font-bold">
                  Transfer PRT Tokens
                </span>
                <span className="text-sm text-center wrap-anywhere text-gray-500 font-mono">
                  {"(For Users & Contract Owner)"}
                </span>
                <div className="flex flex-col w-full gap-2 items-start justify-center">
                  <label
                    htmlFor="transfer-address"
                    className="text-base wrap-anywhere font-mono"
                  >
                    Wallet address
                  </label>
                  <input
                    type="text"
                    placeholder="Enter wallet address"
                    className="w-full p-2 wrap-anywhere placeholder:wrap-anywhere font-mono rounded-lg hover:rounded-3xl transition-all duration-300 border-2 focus:outline-none placeholder:text-gray-400 placeholder:text-sm placeholder:font-mono"
                    value={transferAddress}
                    onChange={handleTransferAddressChange}
                    disabled={
                      transferTokens.isPending ||
                      waitForTransferTokensTx.isLoading
                    }
                    required
                  />
                  <span className="text-red-500 text-sm wrap-anywhere font-mono">
                    {incorrectTransferAddressError}
                  </span>
                </div>
                <div className="flex flex-col w-full gap-2 items-start justify-center">
                  <label
                    htmlFor="transfer-amount"
                    className="text-base wrap-anywhere font-mono"
                  >
                    Transfer amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={
                      accountPRTBalanceInWei.data
                        ? formatUnits(accountPRTBalanceInWei.data as bigint, 18)
                        : "0"
                    }
                    value={transferAmount}
                    onChange={handleTransferAmountChange}
                    onKeyDown={blockInvalidChar}
                    disabled={
                      transferTokens.isPending ||
                      waitForTransferTokensTx.isLoading
                    }
                    required
                    placeholder="Enter amount to transfer"
                    className="w-full wrap-anywhere placeholder:wrap-anywhere p-2 font-mono rounded-lg hover:rounded-3xl transition-all duration-300 border-2 focus:outline-none placeholder:text-gray-400 placeholder:text-sm placeholder:font-mono"
                  />
                  <span className="text-red-500 text-sm wrap-anywhere font-mono">
                    {incorrectTransferAmountError}
                  </span>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-2 mt-4 rounded-lg hover:rounded-3xl transition-all duration-300 bg-black text-white font-bold wrap-anywhere"
                  disabled={
                    incorrectTransferAddressError !== "" ||
                    incorrectTransferAmountError !== "" ||
                    // transferAddress === "" ||
                    // transferAmount === "" ||
                    transferTokens.isPending ||
                    waitForTransferTokensTx.isLoading
                  }
                >
                  {transferTokens.isPending || waitForTransferTokensTx.isLoading
                    ? `Transferring ${transferAmount} PRT ...`
                    : "Transfer Tokens"}
                </button>
              </form>
            </div>
          </div>

          {waitForSendRewardTx.isSuccess && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => {
                setRewardTxHash("");
                setRewardAddress("");
                setRewardAmount("");
              }}
            >
              <div
                className="bg-white rounded-3xl py-10 px-7 shadow-2xl max-w-lg w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center gap-5">
                  <div className="w-15 h-15 bg-white border-2 rounded-full flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-lg text-center wrap-anywhere font-mono text-gray-700">
                      Successfully sent reward of {""}
                      <span className="font-bold text-black">
                        {rewardAmount} PRT
                      </span>{" "}
                      {""}
                      to {rewardAddress}
                    </span>
                    <Link
                      href={`https://sepolia.etherscan.io/tx/${rewardTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="wrap-anywhere font-sans mt-2 underline underline-offset-2"
                    >
                      View On Block Explorer
                    </Link>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRewardTxHash("");
                      setRewardAddress("");
                      setRewardAmount("");
                    }}
                    className="w-1/3 px-6 py-3 mt-4 bg-black text-white flex justify-center font-bold rounded-lg hover:rounded-3xl transition-all duration-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {waitForTransferTokensTx.isSuccess && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => {
                setTransferTxHash("");
                setTransferAddress("");
                setTransferAmount("");
              }}
            >
              <div
                className="bg-white rounded-3xl py-10 px-7 shadow-2xl max-w-lg w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center gap-5">
                  <div className="w-15 h-15 bg-white border-2 rounded-full flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-lg wrap-anywhere text-center font-mono text-gray-700">
                      Successfully transferred {""}
                      <span className="font-bold text-black">
                        {transferAmount} PRT
                      </span>{" "}
                      {""}
                      to {transferAddress}
                    </span>
                    <Link
                      href={`https://sepolia.etherscan.io/tx/${transferTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="wrap-anywhere font-sans mt-2 underline underline-offset-2"
                    >
                      View On Block Explorer
                    </Link>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTransferTxHash("");
                      setTransferAddress("");
                      setTransferAmount("");
                    }}
                    className="w-1/3 px-6 py-3 mt-4 bg-black text-white flex justify-center font-bold rounded-lg hover:rounded-3xl transition-all duration-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
