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
  padding: var(--size-2) var(--size-4);
  background: var(--background);
  border: var(--border);
  position: relative;
  display: inline-flex;
  gap: var(--size-2);
  justify-content: center;
  align-items: center;

  &.non-interactive,
  &[disabled]:not([disabled="false"]) {
    pointer-events: none;
  }
  &[disabled]:not([disabled="false"]) {
    color: var(--muted);
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

  &.block {
    width: 100%;
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

  &.link {
    display: inline-flex;
    align-self: baseline;
    align-items: baseline;
    gap: var(--size-0);
    height: inherit;
    min-height: 0;
    /* margin: 0 var(--spacer-sm) !important; */
    margin: 0 !important;
    padding: 0 var(--size-0) !important;
    line-height: inherit;
    border: 0;

    .icon {
      align-self: center;
    }
  }
}
</style>
