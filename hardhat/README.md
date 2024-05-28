
# ERC20 Token Deployment with Hardhat and Foundry

This project is designed to help you deploy your ERC20 token contracts using Hardhat. It also includes the necessary steps to work with Foundry.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git
- Rust (for Foundry)

## Getting Started

### Clone the Repository

First, clone the repository to your local machine:

### Hardhat Installation

1. **Install Hardhat and Required Dependencies:**

   You can install Hardhat using npm or yarn. Run the following command in your project directory:

   ```bash
   npm install --save-dev hardhat
   ```

   or if you prefer yarn:

   ```bash
   yarn add --dev hardhat
   ```

2. **Create a Hardhat Project:**

   If you haven't already initialized a Hardhat project, you can do so with the following command:

   ```bash
   npx hardhat
   ```

   Follow the prompts to create a basic sample project. This will set up a `hardhat.config.js` file and some sample contracts and scripts.

3. **Install Additional Plugins:**

   Depending on your requirements, you might need additional plugins. Here are some commonly used plugins:

   ```bash
   npm install --save-dev @nomiclabs/hardhat-ethers ethers @nomiclabs/hardhat-waffle

   ```

### Foundry Installation

1. **Install Foundry:**

   Foundry is a smart contract development toolchain. To install Foundry, you need Rust installed on your system. Follow the instructions to install Rust from [here](https://www.rust-lang.org/tools/install).

2. **Install Foundryup:**

   Foundryup is the Foundry toolchain installer. Run the following command to install Foundryup:

   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   ```
   After the installation, run:

   ```bash
   foundryup
   ```

### Deploying Contracts

**Compile Contracts:**

   Before deploying, compile your contracts:

   ```bash
   npx hardhat compile
   ```

**Deploy with Ignition:**

   Run the Ignition deployment script:

   ```bash
   npx hardhat ignition run ignition/erc20deploy.ts --network <network-name>
   ```

