import * as dotenv from 'dotenv'
import type { HardhatUserConfig } from 'hardhat/config'
import type { HardhatNetworkUserConfig, NetworkUserConfig } from 'hardhat/types'
import '@nomicfoundation/hardhat-toolbox-viem'
import 'hardhat-chai-matchers-viem'

import './tasks/accounts'

dotenv.config()

const HARDHAT_NETWORK_CONFIG: HardhatNetworkUserConfig = {
  chainId: 1337,
  // forking: {
  //   url: process.env.MAINNET_URL || '',
  // },
}

const config: HardhatUserConfig = {
  solidity: '0.8.26',
  networks: {
    mainnet: {
      url: process.env.MAINNET_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    localhost: {
      ...HARDHAT_NETWORK_CONFIG,
    },
    hardhat: HARDHAT_NETWORK_CONFIG,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    currency: 'USD',
    gasPrice: 10,
  }
}

export default config
