<template>
  <Loading v-if="loading" />
  <PageFrame v-else :title="[
    {
      text: `Collections`,
      to: `/${id}`
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
const id = useArtistId()
const route = useRoute()
const address = computed(() => route.params.collection.toLowerCase())

const store = useOnchainStore()
const loading = ref(true)
const collection = ref(null)

const load = async () => {
  loading.value = true

  collection.value = await store.fetchCollection(address.value)

  loading.value = false
}

onMounted(() => load())
watch(address, () => load())
</script>

<style lang="postcss" scoped>
</style>
