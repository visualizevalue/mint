<template>
  <div class="fieldset-wrapper">
    <fieldset>
      <slot />
    </fieldset>
  </div>
</template>

<style scoped>
.fieldset-wrapper {
  max-width: -webkit-fill-available;
  container-type: inline-size;
  width: 100%;
}

.fieldset-wrapper > fieldset {
  width: 100%;
  max-width: -webkit-fill-available;
  display: flex;
  flex-wrap: wrap;
  position: relative;

  > * {
    width: 100cqw;
    flex-shrink: 0;
  }

  @container (min-width: 30rem) {
    flex-wrap: nowrap;

    > * {
      width: fit-content;
      flex-shrink: 1;

      &:first-child {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      &:last-child {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }

      &:not(:first-child):not(:last-child) {
        border-radius: 0;
      }
    }
  }

  :deep(> .form-item),
  :deep(> .button) {
    z-index: 1;

    &:--highlight,
    &:has(.input:hover),
    &:has(.input:focus) {
      z-index: 2;
    }

    + .form-item,
    + .button {
      margin-top: calc(-1 * var(--border-width));

      &:--highlight,
      &:has(.input:hover),
      &:has(.input:focus) {
        border-top-color: var(--button-border-color-highlight);
      }

      @container (min-width: 30rem) {
        border-top-color: var(--border-color);
        margin-top: 0;
        margin-left: calc(-1 * var(--border-width));

        &:--highlight,
        &:has(.input:hover),
        &:has(.input:focus) {
          border-top-color: var(--button-border-color-highlight);
          border-left-color: var(--button-border-color-highlight);
        }
      }
    }
  }
}
</style>
