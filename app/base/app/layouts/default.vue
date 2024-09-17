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

<style scoped>
main {
  display: grid;
  gap: var(--spacer);
}
</style>
