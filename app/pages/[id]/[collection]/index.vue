<template>
  <PageFrame :title="breadcrumb">
    <ClientOnly>
      <header v-if="ownedByMe">
        <menu>
          <Button :to="{ name: 'id-collection-mint', params: { id, collection: collection.address } }">Create New</Button>
        </menu>
      </header>
    </ClientOnly>

    <CollectionIntro :collection="collection" />

    <TokenOverviewCard v-for="token of tokens" :key="token.tokenId" :token="token" />

    <div v-if="! tokens.length">
      No tokens yet
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
const ownedByMe = useIsMeCheck(collection.value.owner)

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

const tokens = computed(() => store.tokens(collection.value.address))

onMounted(() => {
  store.fetchCollectionTokens(collection.value.address)
})
</script>

<style lang="postcss" scoped>
  article {
    padding: 1rem;

    h1 {
      font-size: 1.25rem;
    }

    p {
      color: gray;
    }
  }
</style>
