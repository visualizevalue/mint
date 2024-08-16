import type { WatchStopHandle } from 'vue'
import { formatEther, formatGwei } from 'viem'
import { getGasPrice } from '@wagmi/core'
import { useConfig, useBlockNumber } from '@wagmi/vue'

export const useLoadArtistData = (id: `0x${string}`) => {
  const config = useRuntimeConfig()
  const store = useOnchainStore()

  const loading = ref(true)

  const load = async () => {
    loading.value = true
    if (! id) return
    await store.fetchArtist(id, config.public.factoryAddress as `0x${string}`)
    loading.value = false
  }

  onMounted(() => load())

  return {
    load,
    loading,
  }
}

let priceWatcher: WatchStopHandle|null = null
const price: Ref<bigint|null> = ref(null)
export const useGasPrice = async () => {
  const config = useConfig()
  const { data: blockNumber } = useBlockNumber()

  if (! priceWatcher) {
    watch(blockNumber, async () => price.value = await getGasPrice(config))
  }

  if (price.value === null) {
    price.value = await getGasPrice(config)
  }

  const unitPrice = computed(() => ({
    wei: price.value,
    gwei: formatGwei(price.value as bigint),
    eth: formatEther(price.value as bigint),

    formatted: {
      gwei: price.value as bigint > 20000000000n
        ? roundNumber(formatGwei(price.value as bigint))
        : toFloat(formatGwei(price.value as bigint), 1),
      eth: formatEther(price.value as bigint),
    }
  }))

  return unitPrice
}
