<template>
  <PageFrame>
    <header>
      <pre>{{ $route.params.id }}</pre>
      <h1>{{ config.public.title }}</h1>
      <p>{{ config.public.description }}</p>

      <pre>FEEED</pre>
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
