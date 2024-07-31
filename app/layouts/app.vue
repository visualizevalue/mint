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
  padding: 0 0 var(--navbar-height);

  &:not(:has(> .frame-sm)) {
    grid-auto-rows: min-content;
  }

  @media (--md) {
    padding: 0 calc(var(--navbar-width)/2) 0 var(--navbar-width);
  }
}
</style>
