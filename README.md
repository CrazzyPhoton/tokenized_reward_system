# Tokenized Reward System

A decentralized application (dApp) for managing tokenized rewards on the Ethereum blockchain. This project consists of a Hardhat-based smart contract development environment and a Next.js frontend for interacting with the deployed contracts.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [A. Hardhat Setup](#a-hardhat-setup)
  - [1. Environment Variables Configuration](#1-environment-variables-configuration)
  - [2. Deploying RewardToken.sol to Sepolia](#2-deploying-rewardtokensol-to-sepolia)
  - [3. Verifying the Smart Contract](#3-verifying-the-smart-contract)
- [B. Frontend Setup](#b-frontend-setup)
  - [1. Environment Configuration](#1-environment-configuration)
  - [2. Configuring Contract Address](#2-configuring-contract-address)
  - [3. Running the Development Server](#3-running-the-development-server)
- [Technologies Used](#technologies-used)
- [Additional Resources](#additional-resources)
- [License](#license)

---

## Project Structure

Highlights folder and files required to setup and successfully run the project locally:

```git
tokenized_reward_system/
├── hardhat/                                # Smart contract development (Hardhat 3)
│   ├── contracts/RewardToken.sol           # Solidity smart contract
│   ├── ignition/modules/RewardToken.ts     # Hardhat Ignition deployment modules
│   └── hardhat.config.ts                   # Hardhat configuration and environment variables
└── frontend/                               # Next.js dApp frontend
    ├── utils/contract.ts                   # Utility files (contract.ts)
    └── .env.local                          # Environment variables (not committed)
```

---

## Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **MetaMask** or another Web3 wallet
- **Sepolia testnet ETH** (obtain from a faucet)

---

## A. Hardhat Setup

Navigate to the `hardhat` folder:

```bash
cd hardhat
```

Install dependencies:

```bash
npm install
```

### 1. Environment Variables Configuration

This project uses **Hardhat 3**, which supports configuration variables for managing sensitive data securely.

You need to set up the following environment variables:

1. **SEPOLIA_RPC_URL** - Your Sepolia RPC endpoint (e.g., from Alchemy or Infura)
2. **SEPOLIA_PRIVATE_KEY** - Your wallet's private key for deployment
3. **ETHERSCAN_API_KEY** - Your Etherscan API key for contract verification

Hardhat 3 provides the `hardhat-keystore` plugin pre-installed to store secrets encrypted:

**Store your secrets:**

Use the following commands, you'll be prompted to create a keystore password on first use. These values are stored encrypted and can be used automatically by Hardhat.

```bash
npx hardhat keystore set SEPOLIA_RPC_URL
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
npx hardhat keystore set ETHERSCAN_API_KEY
```

For a detailed guide on how to set up these variables, visit this page: [Hardhat Configuration Variables](https://hardhat.org/docs/guides/configuration-variables)

### 2. Deploying RewardToken.sol to Sepolia

Use the following command to deploy the smart contract on Sepolia testnet (Make sure you have sufficient Sepolia ETH):

```bash
npx hardhat ignition deploy --network sepolia ignition/modules/RewardToken.ts
```

After successful deployment, note the **deployed contract address** displayed in the terminal. You'll need this for the frontend configuration.

### 3. Verifying the Smart Contract

Verify smart contract using the following command:

```bash
npx hardhat verify --network sepolia <DEPLOYED_CONTRACT_ADDRESS>
```

Once verified, your contract source code will be publicly available on [Etherscan Sepolia](https://sepolia.etherscan.io/).

---

## B. Frontend Setup

Navigate to the `frontend` folder:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

### 1. Environment Configuration

Create a `.env.local` file in the `frontend` directory:

```bash
touch .env.local
```

Add the following environment variable to `.env.local`:

```ini
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
```

#### Obtaining a Reown (WalletConnect) Project ID

1. Navigate to [https://cloud.reown.com/sign-in](https://cloud.reown.com/sign-in)
2. Sign in or create a new account
3. Click on **"+ Project"** to create a new project
4. Enter your project name and select **AppKit** as the product
5. Select **Next.js** as the framework
6. Click **Create**
7. Copy your **Project ID** from the project dashboard
8. Paste the Project ID into the `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` variable in `.env.local`

**Important:** Configure your allowed domains in the Reown dashboard to prevent unauthorized use of your Project ID.

### 2. Configuring Contract Address

After deploying your `RewardToken` contract to Sepolia, you need to update the frontend with the deployed contract address.

1. Open `utils/contract.ts` in the `frontend` folder
2. Locate the `address` field
3. Replace it with your deployed contract address:

```typescript
export const contractConfig = {
  address: "0xYourDeployedContractAddressHere", // Replace with your contract address
  abi: [
    // ABI array
  ],
};
```

Do not edit the ABI array (You can also find the ABI by visiting the deployed and verified contract on Etherscan Sepolia).

### 3. Running the Development Server

Start the development server:

```bash
npm run dev
```

The dApp will be available at [http://localhost:3000](http://localhost:3000).

Connect your MetaMask wallet (configured to Sepolia testnet) and interact with your deployed smart contract.

---

## Technologies Used

### Smart Contract Development

- **Hardhat 3** - Ethereum development environment
- **Solidity** - Smart contract programming language
- **Hardhat Ignition** - Declarative deployment system
- **Etherscan** - Contract verification and explorer

### Frontend

- **Next.js** - React framework
- **TypeScript** - Type-safe JavaScript
- **Rainbowkit and Walletconnect** - Wallet connection protocol
- **Web3 Libraries** - Blockchain interaction

---

## Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Hardhat 3 Getting Started](https://hardhat.org/hardhat-runner/docs/getting-started)
- [Hardhat Ignition Guide](https://hardhat.org/ignition/docs/getting-started)
- [Reown Documentation](https://docs.reown.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)

---

## License

MIT License

---
