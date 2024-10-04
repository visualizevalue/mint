<template>
  <menu class="tabs">
    <slot name="menu" :active="active" :select="select" />
  </menu>

  <section class="tabs-content">
    <slot name="content" :active="active" />
  </section>
</template>

<script setup>
const props = defineProps(['initial'])

const active = ref(props.initial)
const select = k => active.value = k
</script>

<style>
.tabs {
  padding: 0 var(--size-1);
  margin: 0;
  display: flex;
  gap: var(--size-1);

  > .button {
    margin-bottom: calc(-1 * var(--border-width));
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;

    &.active {
      border-color: var(--border-color);
      border-bottom-color: var(--background);
    }
  }

  .tabs-content {
    border-top: var(--border);
  }
}
</style>

