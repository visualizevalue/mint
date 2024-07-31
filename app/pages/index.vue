<template>
  <div class="home">
    <h1>{{ config.public.title }}</h1>
    <p>{{ config.public.description }}</p>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
</script>

<style lang="postcss" scoped>
.home {
  max-width: 120rem;
  margin: 0 auto;
  background: var(--background);
}
</style>
