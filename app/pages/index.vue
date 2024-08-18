<template>
  <PageFrame>
    <header>
      <h1>{{ config.public.title }}</h1>
      <p>{{ config.public.description }}</p>

      <Connect />
    </header>
  </PageFrame>
</template>

<script setup>
const config = useRuntimeConfig()

definePageMeta({
  middleware: ['redirect-user-scope']
})
</script>

<style lang="postcss" scoped>
</style>
