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

<style>
.button {
  position: relative;
  min-width: fit-content;
  width: fit-content;

  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: var(--ui-padding-x);
  letter-spacing: var(--letter-spacing);

  background: var(--button-background);
  padding: var(--ui-padding-y) var(--ui-padding-x);
  border: var(--button-border);
  border-radius: var(--button-border-radius);

  &.non-interactive,
  &[disabled]:not([disabled="false"]) {
    pointer-events: none;
  }
  &[disabled]:not([disabled="false"]) {
    color: var(--muted);
  }

  &:--highlight {
    background: var(--button-background-highlight);
  }

  > span {
    display: flex;
    gap: var(--ui-padding-x);
    justify-content: center;
    text-align: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  &.small {
    padding: calc(var(--size-1) + var(--size-0)) var(--size-3);
    font-size: var(--font-sm);
    min-height: 0;
  }

  &.link {
    display: inline-flex;
    align-self: baseline;
    align-items: baseline;
    height: inherit;
    min-height: 0;
    margin: 0 !important;
    padding-top: 0;
    padding-bottom: 0;
    line-height: inherit;
    border: 0;

    .icon {
      align-self: center;
    }
  }
}
</style>
