import { VueQueryPlugin } from '@tanstack/vue-query'
import { http, cookieStorage, createConfig, createStorage, WagmiPlugin, fallback } from '@wagmi/vue'
import { mainnet, sepolia, holesky, localhost } from '@wagmi/vue/chains'
import { coinbaseWallet, injected, metaMask, walletConnect } from '@wagmi/vue/connectors'
import type { CustomTransport, Transport } from 'viem'

export default defineNuxtPlugin(nuxtApp => {
  const title = nuxtApp.$config.public.title || 'Mint'

  const transportDefinitions: CustomTransport|Transport[] = []

  if (nuxtApp.$config.public.rpc1) transportDefinitions.push(http(nuxtApp.$config.public.rpc1 as string))
  if (nuxtApp.$config.public.rpc2) transportDefinitions.push(http(nuxtApp.$config.public.rpc2 as string))
  if (nuxtApp.$config.public.rpc3) transportDefinitions.push(http(nuxtApp.$config.public.rpc3 as string))
  transportDefinitions.push(http())

  const transports = fallback(transportDefinitions)

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
      [mainnet.id]: http(), // TODO: replace this with custom transports on mainnet deployment
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
