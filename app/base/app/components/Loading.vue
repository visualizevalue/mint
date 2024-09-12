<template>
  <div class="loader">
    <span v-if="txt" class="text">{{ txt }}</span>
  </div>
</template>

<script setup>
const { txt } = defineProps({
  txt: {
    type: String,
    default: 'Loading...',
  },
})
</script>

<style scoped>
.loader {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacer-sm);

  .text {
    text-transform: var(--text-transform-ui);
    color: var(--muted);
    font-family: var(--ui-font-family);
    font-weight: var(--ui-font-weight);
  }

  &:not(.inline) {
    text-align: center;
    margin: calc(var(--size-6)) 0;
  }

  &.inline {
    display: inline-flex;
    gap: var(--size-1);
    margin-left: var(--size-1);
  }
}
</style>
