<template>
  <section>
    <img v-if="collection.image" :src="collection.image" :alt="collection.name">
    <h1 v-if="collection.name">{{ collection.name }} <small v-if="collection.symbol">{{ collection.symbol }}</small></h1>
    <p v-if="collection.description">{{ collection.description }}</p>
    <p>Init Block: {{ collection.initBlock }}</p>
    <p>Latest Token: {{ collection.latestTokenId }}</p>
    <p>Owner: {{ collection.owner }}</p>
  </section>
</template>

<script setup lang="ts">
const { collection } = defineProps<{
  collection: Collection
}>()
</script>

<style lang="postcss" scoped>
</style>
