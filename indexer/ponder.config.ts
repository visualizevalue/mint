import { parseAbiItem } from 'abitype'
import { createConfig, factory } from 'ponder'

import { FactoryAbi } from './abis/FactoryAbi'
import { MintAbi } from './abis/MintAbi'

const FACTORY_ADDRESS = '0xd717fe677072807057b03705227ec3e3b467b670' as const
const FACTORY_START_BLOCK = 21167599

export default createConfig({
  chains: {
    mainnet: {
      id: 1,
      rpc: process.env.PONDER_RPC_URL_1,
      ws: process.env.PONDER_WS_URL_1,
    },
    // sepolia: {
    //   chainId: 11155111,
    //   transport: http(process.env.PONDER_RPC_URL_11155111),
    // },
  },
  contracts: {
    Factory: {
      chain: 'mainnet',
      abi: FactoryAbi,
      address: FACTORY_ADDRESS,
      startBlock: FACTORY_START_BLOCK,
    },
    Mint: {
      chain: 'mainnet',
      abi: MintAbi,
      address: factory({
        address: FACTORY_ADDRESS,
        event: parseAbiItem('event Created(address indexed owner, address contract)'),
        parameter: 'contract',
      }),
      includeTransactionReceipts: true,
      startBlock: FACTORY_START_BLOCK,
    },
  },
})
