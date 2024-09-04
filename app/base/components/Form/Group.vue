<template>
  <div class="fieldset-wrapper">
    <fieldset>
      <slot />
    </fieldset>
  </div>
</template>

<style lang="postcss" scoped>
.fieldset-wrapper {
  max-width: -webkit-fill-available;
  container-type: inline-size;
  width: 100%;
}

fieldset {
  width: 100%;
  max-width: -webkit-fill-available;
  display: flex;
  flex-wrap: wrap;

  > * {
    width: 100cqw;
    flex-shrink: 0;
  }

  @container (min-width: 30rem) {
    flex-wrap: nowrap;

    > * {
      width: fit-content;
      flex-shrink: 1;
    }
  }

  :deep(> .form-item),
  :deep(> .button) {
    + .form-item,
    + .button {
      border-top-color: transparent;

      &:has(.input:focus) {
        border-top-color: var(--border-color-light);
      }

      @container (min-width: 30rem) {
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
