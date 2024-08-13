import * as dotenv from 'dotenv'
import type { HardhatUserConfig } from 'hardhat/config'
import type { HardhatNetworkUserConfig } from 'hardhat/types'
import '@nomicfoundation/hardhat-toolbox-viem'
import '@nomicfoundation/hardhat-ledger'
import 'hardhat-chai-matchers-viem'

import './tasks/accounts'

dotenv.config()

const ACCOUNT_PRVKEYS: string[] = process.env.PRIVATE_KEY    ? [process.env.PRIVATE_KEY   ] : []
const LEDGER_ACCOUNTS: string[] = process.env.LEDGER_ACCOUNT ? [process.env.LEDGER_ACCOUNT] : []

const HARDHAT_NETWORK_CONFIG: HardhatNetworkUserConfig = {
  chainId: 1337,
  ledgerAccounts: LEDGER_ACCOUNTS,
  // forking: {
  //   url: process.env.MAINNET_URL || '',
  // },
}

const config: HardhatUserConfig = {
  solidity: '0.8.24',
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
  }
}

export default config
