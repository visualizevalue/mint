<template>
  <header>
    <h1>
      {{ config.public.title }}
    </h1>

    <GasPrice></GasPrice>

    <Connect />
  </header>
</template>

<script setup>
const config = useRuntimeConfig()
</script>

<style lang="postcss" scoped>
header {
  height: var(--navbar-height);
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacer-lg);
  padding: var(--size-5);
}

/* COLORS */
header {
  background: var(--black-semi);
  backdrop-filter: blur(var(--size-1));
  border-top: var(--border);
}
</style>
