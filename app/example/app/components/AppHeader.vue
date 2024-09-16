<template>
  <BaseAppHeader
    :style="{
      borderColor: y > 10 ? 'var(--border-color)' : 'transparent'
    }"
  />
</template>

<script setup>
import BaseAppHeader from '@visualizevalue/mint-app-base/app/components/AppHeader.vue'

const { y } = useWindowScroll()
</script>

<style scoped>
  header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--background-semi);
    backdrop-filter: var(--blur);

    border-bottom: var(--border);
    border-color: transparent;
    transition: border-color var(--speed);
  }
</style>
