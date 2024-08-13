import { http, cookieStorage, createConfig, createStorage } from '@wagmi/vue'
import { mainnet, sepolia, holesky, localhost } from '@wagmi/vue/chains'
import { injected, metaMask } from '@wagmi/vue/connectors'

export const config = createConfig({
  chains: [mainnet, sepolia, holesky, localhost],
  connectors: [
    injected(),
    // walletConnect({
    //   projectId: process.env.NUXT_PUBLIC_WC_PROJECT_ID!,
    // }),
    metaMask(),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [holesky.id]: http(),
    [localhost.id]: http(),
  },
})

declare module '@wagmi/vue' {
  interface Register {
    config: typeof config
  }
}
