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
const isMe = useIsMe()
const artistName = useAccountName(id.value)

const subdomain = useSubdomain()
const breadcrumb = computed(() => {
  const path = subdomain.value || isMe.value ? [] : [
    {
      text: artistName,
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
onMounted(() => {
  loading.value = true
  store.fetchCollectionTokens(collection.value.address)
  loading.value = false
})
</script>

<style lang="postcss" scoped>
</style>
