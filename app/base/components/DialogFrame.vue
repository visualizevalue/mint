<template>
  <Teleport to="body">
    <dialog ref="dialog" :class="class">
      <slot />
    </dialog>
  </Teleport>
</template>

<script setup>
defineProps({ class: 'String' })

const dialog = ref()

const close = () => {
  return new Promise((resolve) => {
    const keyFrame = new KeyframeEffect(
      dialog.value,
      [{ translate: '0 var(--spacer)', opacity: '0' }],
      { duration: 300, easing: 'ease', direction: 'normal' }
    )

    const animation = new Animation(keyFrame, document.timeline)
    animation.play()
    animation.onfinish = () => {
      dialog.value.close()
      resolve()
    }
  })
}

const open = () => {
  dialog.value.showModal()
}

defineExpose({
  close,
  open,
})
</script>

<style>
dialog {
  position: fixed;
  padding: calc(var(--spacer)*2);
  max-width: var(--dialog-width);
  width: 100%;
  background: var(--background);
  color: var(--color);
  border: var(--border);
  overscroll-behavior: contain;
  height: min-content;
  opacity: 0;
  pointer-events: none;
  align-content: center;

  &[open] {
    animation: fade-in var(--speed);
    opacity: 1;
    pointer-events: all;
  }

  &::backdrop {
    background: var(--dialog-background-color);
    backdrop-filter: var(--blur);
    pointer-events: none;
  }

  > .close {
    position: absolute;
    top: var(--spacer);
    right: var(--spacer);
    width: var(--spacer);
    height: var(--spacer);
    padding: 0;
    z-index: 10;
  }

  > h1 {
    padding-right: var(--size-6);
    font-family: var(--font-family-ui);
    font-size: var(--font-lg);
    text-transform: var(--text-transform);
    margin-bottom: var(--size-3);
  }

  > .actions {
    margin-top: var(--spacer);
    display: flex;
    gap: var(--spacer);
    justify-content: flex-end;
  }
}

html:has(dialog[open]),
body:has(dialog[open]) {
  overflow: hidden;
}
</style>
