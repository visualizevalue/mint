<template>
  <fieldset>
    <slot />
  </fieldset>
</template>

<style lang="postcss" scoped>
fieldset {
  :deep(button) {
    white-space: nowrap;
    width: 100%;
  }

  @media (--sm) {
    display: flex;
    max-width: 33rem;
  }
}
</style>
