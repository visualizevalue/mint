<template>
  <div>
    <AppHeader />
    <Navbar />

    <main>
      <slot />
    </main>

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
  padding: var(--navbar-height) 0 0;

  &:not(:has(> .frame-sm)) {
    grid-auto-rows: min-content;
  }
}

nav {
  + main {
    padding: var(--navbar-height) 0;

    @media (--md) {
      padding: var(--navbar-height) var(--navbar-width) 0;
    }
  }
}
</style>
