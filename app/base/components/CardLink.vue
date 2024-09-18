<template>
  <NuxtLink :to="to" class="card-link">
    <span>{{ title }}</span>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

withDefaults(defineProps<{
  to: RouteLocationRaw
  title?: string
}>(), {
  title: 'View',
})
</script>

<style scoped>
a {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  border: 0;

  span {
    opacity: 0;
    pointer-events: none;
  }
}
</style>

<style>
*:has(> .card-link) {
  position: relative;
}
</style>
