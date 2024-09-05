// import { custom, fallback } from 'viem'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { http, cookieStorage, createConfig, createStorage, WagmiPlugin } from '@wagmi/vue'
import { mainnet, sepolia, holesky, localhost } from '@wagmi/vue/chains'
import { coinbaseWallet, injected, metaMask, walletConnect } from '@wagmi/vue/connectors'

// const isBrowser = typeof window !== 'undefined' && window !== null
// const transports = isBrowser && window.ethereum
//   ? fallback([ custom(window.ethereum!), http() ])
//   : http()
const transports = http()

export default defineNuxtPlugin(nuxtApp => {
  const title = nuxtApp.$config.public.title || 'Mint'

  const wagmiConfig = createConfig({
    chains: [mainnet, sepolia, holesky, localhost],
    batch: {
      multicall: true,
    },
    connectors: [
      injected(),
      walletConnect({
        projectId: nuxtApp.$config.public.walletConnectProjectId,
      }),
      coinbaseWallet({
        appName: title,
        appLogoUrl: '',
      }),
      metaMask({
        dappMetadata: {
          name: title,
          iconUrl: '',
          url: '',
        }
      }),
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

  nuxtApp.vueApp.use(WagmiPlugin, { config: wagmiConfig }).use(VueQueryPlugin, {})

  return {
    provide: {
      wagmi: wagmiConfig,
    }
  }
})
