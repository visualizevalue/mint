import { WagmiPlugin, http, createConfig } from '@wagmi/vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { mainnet, sepolia } from '@wagmi/vue/chains'

export default defineNuxtPlugin(nuxtApp => {
  const config = createConfig({
    chains: [mainnet, sepolia],
    ssr: true,
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  })

  const queryClient = new QueryClient()

  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient })
  nuxtApp.vueApp.use(WagmiPlugin, { config })
})
