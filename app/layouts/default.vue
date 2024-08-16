<template>
  <div>
    <AppHeader />
    <Navbar />

    <main>
      <slot />
    </main>
  </div>
</template>

<script setup>
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
