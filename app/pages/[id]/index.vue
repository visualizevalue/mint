<template>
  <Loading v-if="loading" />
  <PageFrame v-else>
    <header v-if="isMe">
      <h1>Your Collections</h1>
      <menu>
        <Button :to="`/${$route.params.id}/create`">Create New</Button>
        <Button :to="`/${$route.params.id}/add`">Add Existing</Button>
      </menu>
    </header>

    <section v-if="store.all.length">
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
        <Button :to="`/${$route.params.id}/${collection.address}`">View</Button>
      </article>
    </section>
    <section v-else>
      <template v-if="isMe">
        <p>It looks like you haven't deployed any collections.</p>
        <Button :to="`${$route.params.id}/create`">Create your first</Button>
      </template>
      <template v-else>
        <p>It looks like this account hasn't deployed any collections.</p>
      </template>
    </section>
  </PageFrame>
</template>

<script setup>
const config = useRuntimeConfig()
const store = useCollectionsStore()
const route = useRoute()

const loading = ref(true)
const load = async () => {
  loading.value = true
  await store.fetchCollections(route.params.id, config.public.factoryAddress)
  loading.value = false
}

const isMe = useIsMe()
onMounted(() => load())
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
