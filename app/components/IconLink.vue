<template>
  <NuxtLink :to="to" :title="title">
    <Icon :type="type" />
  </NuxtLink>
</template>

<script setup>
defineProps({
  to: String,
  title: String,
  type: String,
})
</script>

<style lang="postcss" scoped>
a {
  color: var(--muted);
  transition: all var(--speed);
  width: var(--size-5);
  height: var(--size-5);
  display: flex;
  align-items: center;
  justify-content: center;

  &:--highlight {
    color: var(--color);
  }
}
</style>
