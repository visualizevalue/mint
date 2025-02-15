import { createConfig, factory } from 'ponder'
import { parseAbiItem } from 'abitype'
import { fallback, http } from 'viem'

import { FactoryAbi } from './abis/FactoryAbi'
import { MintAbi } from './abis/MintAbi'

export default createConfig({
  networks: {
    mainnet: {
      chainId: 1,
      transport: fallback([
        http(process.env.PONDER_RPC_URL_1_1),
        http(process.env.PONDER_RPC_URL_1_2),
        http(process.env.PONDER_RPC_URL_1_3),
      ]),
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
      factory: factory({
        address: '0xd717Fe677072807057B03705227EC3E3b467b670',
        event: parseAbiItem('event Created(address indexed owner, address contract)'),
        parameter: 'contract',
      }),
      includeTransactionReceipts: true,
      startBlock: 21167599,
    },
  },
})
