import type { WatchStopHandle } from 'vue'
import { formatEther, formatGwei } from 'viem'
import { getGasPrice } from '@wagmi/core'
import { useConfig, useBlockNumber } from '@wagmi/vue'

let priceWatcher: WatchStopHandle|null = null
const price: Ref<bigint> = ref(0n)
export const useGasPrice = () => {
  const config = useConfig()
  const { data: blockNumber } = useBlockNumber()

  const updatePrice = async () => {
    price.value = await getGasPrice(config)
  }

  if (! priceWatcher) {
    updatePrice()

    priceWatcher = watch(blockNumber, () => updatePrice())
  }

  const unitPrice = computed(() => ({
    wei: price.value,
    gwei: formatGwei(price.value as bigint),
    eth: formatEther(price.value as bigint),

    formatted: {
      gwei: price.value as bigint > 2_000_000_000_000n
        ? roundNumber(formatGwei(price.value as bigint))
        : toFloat(formatGwei(price.value as bigint), 1),
      eth: formatEther(price.value as bigint),
    }
  }))

  return unitPrice
}

export const useMintPrice = (mintCount: Ref<number>) => {
  const gasPrice = useGasPrice()

  const price = computed(() => (gasPrice.value.wei || 0n) * 60_000n * BigInt(mintCount.value))
  const displayPrice = computed(() => customFormatEther(price.value))

  return {
    price,
    displayPrice,
    gasPrice,
  }
}

