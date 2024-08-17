<template>
  <article>
    <img v-if="collection.image" :src="collection.image" :alt="collection.name">
    <h1>{{ collection.name }} <small>{{ collection.symbol }}</small></h1>
    <p>{{ collection.description }}</p>
    <p>Init Block: {{ collection.initBlock }}</p>
    <p>Latest Token: {{ collection.latestTokenId }}</p>
    <p>Owner: {{ collection.owner }}</p>
    <Button :to="{ name: 'id-collection', params: { id: collection.owner, collection: collection.address } }">View</Button>
  </article>
</template>

<script setup lang="ts">
const { collection } = defineProps<{
  collection: Collection
}>()
</script>

<style lang="postcss" scoped>
section {
  display: grid;
  gap: var(--spacer-lg);
}
</style>
