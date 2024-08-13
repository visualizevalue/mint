<template>
  <Authenticated>
    <PageFrame title="Home">
      <header>
        <h1>{{ config.public.title }}</h1>
        <p>{{ config.public.description }}</p>
      </header>

      <section v-if="store.collections.length">
        <h1>Your Collections</h1>
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
      <section v-else>
        <p>It doesn't look like you have deployed Mint collections.</p>
        <Button to="/create">Deploy your first</Button>
      </section>
    </PageFrame>
  </Authenticated>
</template>

<script setup>
const config = useRuntimeConfig()
const store = useCollectionsStore()
</script>

<style lang="postcss" scoped>
</style>
