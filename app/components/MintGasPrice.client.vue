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
const { price, displayPrice } = await useMintPrice(mintCount)
const priceFeed = usePriceFeedStore()
const dollarPrice = computed(() => priceFeed.weiToUSD(price.value))
</script>
