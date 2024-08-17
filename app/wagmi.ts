import { custom, fallback } from 'viem'
import { http, cookieStorage, createConfig, createStorage } from '@wagmi/vue'
import { mainnet, sepolia, holesky, localhost } from '@wagmi/vue/chains'
import { injected, metaMask } from '@wagmi/vue/connectors'

const title = process.env.NUXT_PUBLIC_TITLE || 'Mint'
const isBrowser = typeof window !== 'undefined' && window !== null
// const transports = isBrowser && window.ethereum
//   ? fallback([ custom(window.ethereum!), http() ])
//   : http()
const transports = http()

export const config = createConfig({
  chains: [mainnet, sepolia, holesky, localhost],
  batch: {
    multicall: true,
  },
  connectors: [
    injected(),
    // walletConnect({
    //   projectId: process.env.NUXT_PUBLIC_WC_PROJECT_ID!,
    // }),
    // metaMask({
    //   dappMetadata: {
    //     name: title,
    //   }
    // }),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [mainnet.id]: transports,
    [sepolia.id]: transports,
    [holesky.id]: transports,
    [localhost.id]: transports,
  },
})

declare module '@wagmi/vue' {
  interface Register {
    config: typeof config
  }
}
