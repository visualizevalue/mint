<template>
  <fieldset>
    <slot />
  </fieldset>
</template>

<style lang="postcss" scoped>
fieldset {
  :deep(.form-item) {
    + .form-item {
      border-left-color: transparent;

      &:has(.input:focus) {
        border-left-color: var(--border-color-light);
      }
    }
  }

  :deep(button),
  :deep(input) {
    white-space: nowrap;
    width: 100%;
  }

  @media (--sm) {
    display: flex;
  }
}
</style>
