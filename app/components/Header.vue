<template>
  <header>
    <slot />
  </header>
</template>

<style lang="postcss" scoped>
header {
  display: flex;
  gap: var(--spacer);
  justify-content: space-between;
  align-items: center;

  :deep(> h1) {
    white-space: nowrap;
  }
}
</style>
