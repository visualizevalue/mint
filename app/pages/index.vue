<template>
  <PageFrame>
    <header>
      <h1>{{ config.public.title }}</h1>
      <p>{{ config.public.description }}</p>

      <Connect @connected="($event) => navigateTo({ name: 'id', params: { id: $event.address }})" />
    </header>
  </PageFrame>
</template>

<script setup>
const config = useRuntimeConfig()
</script>

<style lang="postcss" scoped>
</style>
