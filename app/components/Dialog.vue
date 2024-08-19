<template>
  <dialog ref="dialog">
    <slot />
  </dialog>
</template>

<script setup>
const dialog = ref()

const close = () => {
  dialog.value.close()
}

const open = () => {
  dialog.value.showModal()
}

defineExpose({
  close,
  open,
})
</script>

<style lang="postcss">
dialog {
  position: relative;
  padding: calc(var(--spacer)*2);
  max-width: var(--dialog-width);
  width: 100%;
  background: var(--background);
  color: vaR(--color);
  border: var(--border);

  &::backdrop {
    background-image: linear-gradient(
      45deg,
      var(--gray-z-0-semi),
      var(--gray-z-1-semi),
      var(--gray-z-2-semi)
    );
    backdrop-filter: var(--blur);
  }

  .inner {
    > .close {
      position: absolute;
      top: var(--spacer);
      right: var(--spacer);
      width: var(--size-4);
    }

    > h1 {
      padding-right: var(--size-6);
      font-family: var(--font-family-ui);
      font-size: var(--font-lg);
      text-transform: uppercase;
      margin-bottom: var(--size-3);
    }

    > .actions {
      margin-top: var(--spacer);
      display: flex;
      gap: var(--spacer);
      justify-content: flex-end;
    }
  }

}
</style>
