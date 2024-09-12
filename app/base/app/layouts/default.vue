<template>
  <div>
    <AppHeader />

    <main>
      <slot />
    </main>
  </div>
</template>

<script setup>
// Fetch and update price feed
const priceFeed = usePriceFeedStore()
onMounted(() => {
  priceFeed.fetchEthUsdPrice()

  setInterval(() => priceFeed.fetchEthUsdPrice(), 60 * 60 * 1000) // once per hour
})
</script>

<style scoped>
main {
  display: grid;
  gap: var(--spacer);

  &:not(:has(> .frame-sm)) {
    grid-auto-rows: min-content;
  }
}
</style>
