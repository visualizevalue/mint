<template>
  <Loading v-if="loading" />
  <NuxtPage v-else :collection="collection" />
</template>

<script setup>
const route = useRoute()
const id = useArtistId()
const address = computed(() => route.params.collection.toLowerCase())

const store = useOnchainStore()
const loading = ref(true)
const collection = ref(null)

const load = async () => {
  loading.value = true

  try {
    collection.value = await store.fetchCollection(address.value)

    if (collection.value?.owner !== id.value) {
      throw new Error('Invalid owner')
    }
  } catch (e) {
    navigateTo({ name: 'id' }, { replace: true })
  }

  loading.value = false
}

onMounted(() => load())
watch(address, () => load())
</script>
