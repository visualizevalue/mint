import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable } from "hardhat/config";

import { accountsTask, fundAccountTask } from "./tasks/accounts.js";
import { mineTask, blockTask, purchaseTask } from "./tasks/chain.js";
import { exportAbiFactoryTask, exportAbiMintTask, exportAbiRendererTask } from "./tasks/export-abis.js";
import { interactMintUriTask } from "./tasks/interact.js";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  tasks: [
    accountsTask,
    fundAccountTask,
    mineTask,
    blockTask,
    purchaseTask,
    exportAbiFactoryTask,
    exportAbiMintTask,
    exportAbiRendererTask,
    interactMintUriTask,
  ],
  solidity: {
    profiles: {
      default: {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100_000,
          },
        },
      },
      production: {
        version: "0.8.24",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100_000,
          },
        },
      },
    },
  },
  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
      blockGasLimit: 1_000_000_000,
      allowUnlimitedContractSize: true,
    },
    localhost: {
      type: "edr-simulated",
      chainType: "l1",
      blockGasLimit: 1_000_000_000,
      allowUnlimitedContractSize: true,
    },
    mainnet: {
      type: "http",
      chainType: "l1",
      url: configVariable("MAINNET_URL"),
      accounts: [configVariable("PRIVATE_KEY")],
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_URL"),
      accounts: [configVariable("PRIVATE_KEY")],
    },
    holesky: {
      type: "http",
      chainType: "l1",
      url: configVariable("HOLESKY_URL"),
      accounts: [configVariable("PRIVATE_KEY")],
    },
  },
};

export default config;
