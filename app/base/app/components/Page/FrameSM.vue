<template>
  <section class="frame-sm">
    <slot />
  </section>
</template>

<style scoped>
.frame-sm {
  width: 100%;
  max-width: var(--dialog-width);
  min-height: 100dvh;
  padding: var(--spacer);
  margin: 0 auto;
  display: flex;
  height: fit-content;
  align-self: center;
  flex-direction: column;
  gap: var(--spacer-lg);
  justify-content: center;
  align-items: center;
  background: var(--gray-z-1);

  :deep(> div) {
    width: 100%;
  }

  @media (--sm) {
    min-height: 0;
    margin: 0 auto 10vh;
    border: var(--border);
  }
}
</style>
