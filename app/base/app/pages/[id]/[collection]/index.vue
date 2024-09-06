<template>
  <PageFrame :title="breadcrumb">
    <CollectionIntro :collection="collection" />

    <TokenOverviewCard v-for="token of tokens" :key="token.tokenId" :token="token" />

    <Loading v-if="loading" />
    <div v-if="! tokens.length && !loading" class="centered">
      <p class="muted">No tokens yet</p>
    </div>
  </PageFrame>
</template>

<script setup>
const props = defineProps(['collection'])
const collection = computed(() => props.collection)
const id = useArtistId()
const store = useOnchainStore()

const hideArtist = useShowArtistInHeader()
const breadcrumb = computed(() => {
  const path = hideArtist.value ? [] : [
    {
      text: store.displayName(id.value),
      to: { name: 'id', params: { id } }
    }
  ]

  return [
    ...path,
    {
      text: collection.value.name
    }
  ]
})

useMetaData({
  title: `${collection.value.name}`,
})

const tokens = computed(() => store.tokens(collection.value.address))
const loading = ref(false)
onMounted(async () => {
  loading.value = true
  await store.fetchCollectionTokens(collection.value.address)
  loading.value = false
})
</script>

<style scoped>
</style>
