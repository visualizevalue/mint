import * as dotenv from 'dotenv'
import { zeroAddress } from 'viem'
import type { HardhatUserConfig } from 'hardhat/config'
import type { HardhatNetworkUserConfig } from 'hardhat/types'
import '@nomicfoundation/hardhat-toolbox-viem'
import '@nomicfoundation/hardhat-ledger'
import 'hardhat-chai-matchers-viem'

import './tasks/accounts'
import './tasks/chain'
import './tasks/export-abis'

dotenv.config()

const LEDGER_ACCOUNTS: string[] = process.env.LEDGER_ACCOUNT ? [process.env.LEDGER_ACCOUNT] : []
const ACCOUNT_PRVKEYS: string[] = process.env.PRIVATE_KEY    ? [process.env.PRIVATE_KEY   ] : []
const DEPLOY_AUTH: string = process.env.DEPLOY_AUTH || zeroAddress
const REDEPLOY_PROTECTION: string = process.env.REDEPLOY_PROTECTION === 'true' ? `01` : `00`
const ENTROPY: string = process.env.ENTROPY || `0000000000000000000009`
const SALT: string = `${DEPLOY_AUTH}${REDEPLOY_PROTECTION}${ENTROPY}`

const HARDHAT_NETWORK_CONFIG: HardhatNetworkUserConfig = {
  chainId: 1337,
  ledgerAccounts: LEDGER_ACCOUNTS,
  // forking: {
  //   url: process.env.MAINNET_URL || '',
  // },
}

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 100_000,
      },
    },
  },
  networks: {
    mainnet: {
      url: process.env.MAINNET_URL || "",
      accounts: ACCOUNT_PRVKEYS,
      ledgerAccounts: LEDGER_ACCOUNTS,
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || "",
      accounts: ACCOUNT_PRVKEYS,
      ledgerAccounts: LEDGER_ACCOUNTS,
    },
    holesky: {
      url: process.env.HOLESKY_URL || "",
      accounts: ACCOUNT_PRVKEYS,
      ledgerAccounts: LEDGER_ACCOUNTS,
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
  },
  ignition: {
    strategyConfig: {
      create2: {
        salt: SALT,
      },
    },
  },
  mocha: {
    // timeout: 5_000,
  }
}

export default config
