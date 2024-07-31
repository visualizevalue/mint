<template>
  <slot>
    <span>{{ unitPrice.gwei }} GWEI</span>
  </slot>
</template>

<script setup>
import { formatEther, formatGwei } from 'viem'
import { useConfig, useBlockNumber } from '@wagmi/vue'
import { getGasPrice } from '@wagmi/core'

const config = useConfig()
const { data: blockNumber } = useBlockNumber()

const price = ref(await getGasPrice(config))
watch(blockNumber, async () => price.value = await getGasPrice(config))

const unitPrice = computed(() => ({
  gwei: toFloat(formatGwei(price.value), 1),
  eth: formatEther(price.value),
}))
</script>
