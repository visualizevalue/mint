<template>
  <div>
    <AppHeader />

    <main>
      <slot />
    </main>

    <Navbar />

    <ToggleDarkMode />
  </div>
</template>

<script setup>
// Fetch and update price feed
const priceFeed = usePriceFeedStore()
onMounted(() => {
  priceFeed.fetchEthUsdPrice()

  setInterval(() => priceFeed.fetchEthUsdPrice(), 60 * 60 * 1000)
})
</script>

<style lang="postcss" scoped>
main {
  display: grid;
  gap: var(--spacer);
  min-height: 100dvh;

  &:not(:has(> .frame-sm)) {
    grid-auto-rows: min-content;
  }

  /* Frame space around navbars */
  padding: var(--navbar-height) 0 var(--navbar-height);

  @media (--md) {
    padding: var(--navbar-height) 0 0;
  }
}
</style>
