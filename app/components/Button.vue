<template>
  <NuxtLink v-if="to" :to="to" class="button" :exact="exact" :target="target"><slot /></NuxtLink>
  <button v-else class="button"><slot /></button>
</template>

<script setup>
defineProps({
  to: [String,Object],
  target: {
    type: String,
    default: '_self',
  },
  exact: Boolean,
})
</script>

<style lang="postcss">
.button {
  min-width: fit-content;
  width: fit-content;
  padding: var(--size-3) var(--size-4);
  background: var(--background);
  border: var(--border);
  position: relative;
  display: inline-flex;
  gap: var(--size-2);
  justify-content: center;
  align-items: center;

  &[disabled]:not([disabled="false"]) {
    pointer-events: none;
    opacity: 0.5;
  }

  &:--highlight {
    background: var(--border-color);
  }

  > span {
    display: flex;
    gap: var(--size-2);
    justify-content: center;
    text-align: center;
    align-items: center;
    width: 100%;
    height: 100%;

    .icon {
      width: var(--size-4);
      height: var(--size-4);
    }
  }

  &.left {
    justify-content: flex-start;
    text-align: left;
  }

  &.small {
    padding: calc(var(--size-1) + var(--size-0)) var(--size-3);
    font-size: var(--font-sm);
    min-height: 0;

    > span {
      .icon {
        width: var(--size-3);
        height: var(--size-3);
      }
    }
  }
}
</style>
