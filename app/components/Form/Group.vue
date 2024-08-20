<template>
  <fieldset>
    <slot />
  </fieldset>
</template>

<style lang="postcss" scoped>
fieldset {
  width: 100%;
  max-width: -webkit-fill-available;

  :deep(button),
  :deep(input) {
    white-space: nowrap;
    width: 100%;
  }

  @media (--sm) {
    display: flex;
  }

  :deep(.form-item),
  :deep(.button) {
    + .form-item,
    + .button {
      border-top-color: transparent;

      &:has(.input:focus) {
        border-top-color: var(--border-color-light);
      }

      @media (--sm) {
        border-top-color: var(--border-color);
        border-left-color: transparent;

        &:has(.input:focus) {
          border-left-color: var(--border-color-light);
        }
      }
    }
  }
}
</style>
