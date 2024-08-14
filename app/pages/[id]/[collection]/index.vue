<template>
  <Loading v-if="loading" />
  <PageFrame v-else :title="[
    {
      text: `Collections`,
      to: `/${$route.params.id}`
    },
    {
      text: `${ collection?.name }`
    }
  ]">
    <section>
      <img v-if="collection.image" :src="collection.image" :alt="collection.name">
      <h1>{{ collection.name }} <small>{{ collection.symbol }}</small></h1>
      <p>{{ collection.description }}</p>
      <p>Init Block: {{ collection.initBlock }}</p>
      <p>Latest Token: {{ collection.latestTokenId }}</p>
      <p>Owner: {{ collection.owner }}</p>
    </section>
    <section>
      No tokens yet
    </section>
  </PageFrame>
</template>

<script setup>
const route = useRoute()
const address = route.params.collection.toLowerCase()

const store = useCollectionsStore()
const loading = ref(true)
const collection = ref(null)

const load = async () => {
  loading.value = true

  await store.fetchCollection(address)

  collection.value = await store.collection(address)

  loading.value = false
}

onMounted(() => load())
</script>

<style lang="postcss" scoped>
</style>
