import { createConfig } from '@ponder/core'
import { parseAbiItem } from 'abitype'
import { http } from 'viem'

import { FactoryAbi } from './abis/FactoryAbi'
import { MintAbi } from './abis/MintAbi'

export default createConfig({
  networks: {
    mainnet: {
      chainId: 1,
      transport: http(process.env.PONDER_RPC_URL_1),
    },
    // sepolia: {
    //   chainId: 11155111,
    //   transport: http(process.env.PONDER_RPC_URL_11155111),
    // },
  },
  contracts: {
    Factory: {
      network: 'mainnet',
      abi: FactoryAbi,
      address: '0xd717Fe677072807057B03705227EC3E3b467b670',
      startBlock: 21167599,
    },
    Mint: {
      network: 'mainnet',
      abi: MintAbi,
      factory: {
        address: '0xd717Fe677072807057B03705227EC3E3b467b670',
        event: parseAbiItem('event Created(address indexed owner, address contract)'),
        parameter: 'contract',
      },
      includeTransactionReceipts: true,
      startBlock: 21167599,
    },
  },
})
