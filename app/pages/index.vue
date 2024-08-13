<template>
  <PageFrame>
    <header>
      <h1>{{ config.public.title }}</h1>
      <p>{{ config.public.description }}</p>

      <Connect @connected="() => navigateTo('/home')" />
    </header>
  </PageFrame>
</template>

<script setup>
const config = useRuntimeConfig()

definePageMeta({
  layout: 'static'
})
</script>

<style lang="postcss" scoped>
</style>
