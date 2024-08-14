<template>
  <Authenticated>
    <PageFrame title="Collections">
      <header>
        <menu>
          <Button :to="`/${$route.params.id}/collections/create`">Create New</Button>
          <Button :to="`/${$route.params.id}/collections/add`">Add Existing</Button>
        </menu>
      </header>
      <section>
        <div v-if="! store.all.length">
          <p>You don't have any collections.</p>
        </div>
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
    </PageFrame>
  </Authenticated>
</template>

<script setup>
const store = useCollectionsStore()
</script>

<style lang="postcss" scoped>
menu {
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: flex-end;
  gap: var(--spacer);
}
</style>
