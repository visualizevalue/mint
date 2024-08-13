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
  padding: var(--navbar-height) 0;

  &:not(:has(> .frame-sm)) {
    grid-auto-rows: min-content;
  }

  @media (--md) {
    padding: var(--navbar-height) calc(var(--navbar-width)/2) 0 var(--navbar-width);
  }
}
</style>
