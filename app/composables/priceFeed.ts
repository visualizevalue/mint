import { getPublicClient } from '@wagmi/core'

const CHAINLINK_PRICE_FEED_ABI = [
  {
    inputs: [],
    name: 'latestRoundData',
    outputs: [
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
      { internalType: 'int256', name: 'answer', type: 'int256' },
      { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
      { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
      { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
] as const

const PRICE_FEED_ADDRESS = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419'

export const usePriceFeedStore = () => {
  const { $wagmi } = useNuxtApp()

  return defineStore('priceFeedStore', {

    state: () => ({
      version: 1,
      lastUpdated: 0,
      ethUSDRaw: null as bigint|null,
    }),
    getters: {
      ethUSD: store => store.ethUSDRaw ? (store.ethUSDRaw / BigInt(1e8)) : 0n,
      ethUSC: store => store.ethUSDRaw ? (store.ethUSDRaw / BigInt(1e6)) : 0n,
      ethUSDFormatted () {
        return formatNumber(Number(this.ethUSC) / 100, 2)
      },
      weiToUSD (store) {
        return (wei: bigint) => {
          const cents = (wei * (store.ethUSDRaw || 0n)) / (10n ** 18n) / (10n ** 6n)

          return formatNumber(Number(cents) / 100, 2)
        }
      },
    },

    actions: {
      async fetchEthUsdPrice () {
        const client = getPublicClient($wagmi, { chainId: 1 })

        if (nowInSeconds() - this.lastUpdated < 3_600) {
          return this.ethUSD
        }

        try {
          const [, answer] = await client.readContract({
            address: PRICE_FEED_ADDRESS,
            abi: CHAINLINK_PRICE_FEED_ABI,
            functionName: 'latestRoundData'
          })

          this.ethUSDRaw = answer
          this.lastUpdated = nowInSeconds()
        } catch (error) {
          console.error('Error fetching price:', error)
        }

        return this.ethUSD
      }
    },

    persist: {
      storage: persistedState.localStorage,
      serializer: {
        serialize: stringifyJSON,
        deserialize: parseJSON,
      },
    },

  })()
}
