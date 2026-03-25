import { createQueryClient } from '@1001-digital/dapp-query-core'
import { idbCache } from '@1001-digital/dapp-query-core'
import { dappQueryPlugin } from '@1001-digital/dapp-query-vue'
import { createQueries, type MintQueries } from '~/queries'
import type { QueryClient } from '@1001-digital/dapp-query-core'

export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = createQueryClient({
    cache: idbCache('mint-query'),
    defaultStaleTime: 60_000,
  })

  const config = nuxtApp.$config.public
  const endpoints = config.indexerEndpoints
    ? String(config.indexerEndpoints).split(/\s+/).filter(Boolean)
    : []

  const queries = createQueries({
    wagmi: nuxtApp.$wagmi as any,
    chainId: Number(config.chainId),
    factory: config.factoryAddress as `0x${string}`,
    endpoints,
  })

  nuxtApp.vueApp.use(dappQueryPlugin, queryClient)

  return {
    provide: {
      queryClient,
      queries,
    },
  }
})

declare module '#app' {
  interface NuxtApp {
    $queryClient: QueryClient
    $queries: MintQueries
  }
}
