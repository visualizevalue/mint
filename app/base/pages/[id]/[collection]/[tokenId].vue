<template>
  <Loading v-if="loading" />
  <NuxtPage v-else :collection="collection" :token="token" />
</template>

<script setup>
const props = defineProps(['collection'])
const route = useRoute()
const collection = computed(() => props.collection)

const store = useOnchainStore()
const token = computed(() => collection.value.tokens[route.params.tokenId])
const loading = ref(true)

const load = async () => {
  loading.value = true

  try {
    await store.fetchToken(collection.value.address, route.params.tokenId)
  } catch (e) {
    navigateTo({ name: 'id-collection' }, { replace: true })
  }

  loading.value = false
}

onMounted(() => load())
watch(route, () => load())
</script>
