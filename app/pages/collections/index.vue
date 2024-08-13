<template>
  <Authenticated>
    <PageFrame title="Collections">
      <section>
        <article
          v-for="collection in store.collections"
          :key="collection.address"
        >
          <img :src="collection.image" :alt="collection.name">
          <h1>{{ collection.name }} <small>{{ collection.symbol }}</small></h1>
          <p>{{ collection.description }}</p>
          <p>Init Block: {{ collection.initBlock }}</p>
          <p>Latest Token: {{ collection.latestTokenId }}</p>
          <Button :to="`/collections/${collection.address}`">View</Button>
        </article>
      </section>
    </PageFrame>
  </Authenticated>
</template>

<script setup>
const store = useCollectionsStore()
</script>

<style lang="postcss" scoped>
</style>
