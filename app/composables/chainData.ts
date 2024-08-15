import type { WatchStopHandle } from 'vue'
import { formatEther, formatGwei } from 'viem'
import { getGasPrice } from '@wagmi/core'
import { useConfig, useBlockNumber } from '@wagmi/vue'

let idWatcher: WatchStopHandle|null = null
const id: Ref<`0x${string}`|null> = ref(null)
export const useArtistId = () => {
  const route = useRoute()

  const updateId = () => {
    id.value = route.params.id
      ? (route.params.id as string).toLowerCase() as `0x${string}`
      : null
  }

  if (! idWatcher) {
    updateId()
    idWatcher = watch(() => route.params.id, () => updateId())
  }

  return id
}

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
