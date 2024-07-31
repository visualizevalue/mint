<template>
  <div>
    <AppHeader />

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
</style>
