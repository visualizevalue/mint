<template>
  <span>
    {{ displayPrice.value }} {{ displayPrice.format }}

    <span class="usd">(${{ dollarPrice }})</span>
  </span>
</template>

<script setup>
const props = defineProps({
  mintCount: {
    type: Number,
    default: 1,
  }
})
const mintCount = computed(() => props.mintCount)
const { price, displayPrice } = useMintPrice(mintCount)
const priceFeed = usePriceFeedStore()
const dollarPrice = computed(() => {
  const usd = priceFeed.weiToUSD(price.value)
  return parseFloat(usd) > 0 ? usd : `<0.00`
})
</script>
