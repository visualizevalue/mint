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
  border-bottom: var(--border);
  padding: 0 var(--size-1);
  margin: 0;
  display: flex;
  gap: var(--size-1);

  > Button {
    /* border-bottom-color: transparent; */
    margin-bottom: calc(-1 * var(--border-width));

    &.active {
      border-color: var(--border-color);
      border-bottom-color: var(--background);
    }
  }
}
</style>

