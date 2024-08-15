import type { WatchStopHandle } from 'vue'
import { formatEther, formatGwei } from 'viem'
import { getGasPrice } from '@wagmi/core'
import { useConfig, useBlockNumber } from '@wagmi/vue'

let idWatcher: WatchStopHandle|null = null
const id: Ref<`0x${string}`|null> = ref(null)
export const useArtistId = () => {
  const route = useRoute()

  const updateId = () => {
    id.value = (route.params.id as string).toLowerCase() as `0x${string}`
  }
  if (! idWatcher) {
    updateId()
    idWatcher = watch(() => route.params.id, () => updateId())
  }

  return id
}

export const useScopedOnchainData = () => {
  const config = useRuntimeConfig()
  const store = useOnchainStore()
  const id = useArtistId()

  const loading = ref(true)

  const load = async () => {
    loading.value = true
    if (! id.value) return
    await store.fetchArtist(id.value, config.public.factoryAddress as `0x${string}`)
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
