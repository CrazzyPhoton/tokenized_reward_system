import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("RewardTokenModule", (m) => {
  const rewardToken = m.contract("RewardToken");
  return { rewardToken };
});
