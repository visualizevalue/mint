<template>
  <span class="gas">
    {{ displayPrice.value }} {{ displayPrice.format }}
    (${{ dollarPrice }})
  </span>
</template>

<script setup>
const mintCount = ref(1)
const { price, displayPrice } = await useMintPrice(mintCount)
const priceFeed = usePriceFeedStore()
const dollarPrice = computed(() => priceFeed.weiToUSD(price.value))
</script>
