<template>
  <Authenticated>
    <PageFrame title="Home">
      <header>
        <h1>{{ config.public.title }}</h1>
        <p>{{ config.public.description }}</p>
      </header>

      <section v-if="store.all.length">
        <h1>Your Collections</h1>
        <article
          v-for="collection in store.all"
          :key="collection.address"
        >
          <img v-if="collection.image" :src="collection.image" :alt="collection.name">
          <h1>{{ collection.name }} <small>{{ collection.symbol }}</small></h1>
          <p>{{ collection.description }}</p>
          <p>Init Block: {{ collection.initBlock }}</p>
          <p>Latest Token: {{ collection.latestTokenId }}</p>
          <p>Owner: {{ collection.owner }}</p>
          <Button :to="`/${$route.params.id}/collections/${collection.address}`">View</Button>
        </article>
      </section>
      <section v-else>
        <p>It doesn't look like you have deployed Mint collections.</p>
        <Button to="/collections/create">Deploy your first</Button>
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
