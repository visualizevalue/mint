<template>
  <PageFrame :title="[
    {
      text: `Collections`,
      to: { name: 'id', params: { id } }
    },
    {
      text: `${ collection?.name }`
    }
  ]">
    <header v-if="ownedByMe">
      <menu>
        <Button :to="{ name: 'id-collection-mint', params: { id, collection: collection.address } }">Create New</Button>
      </menu>
    </header>

    <CollectionIntro :collection="collection" />

    <TokenOverviewCard v-for="token of tokens" :key="token.tokenId" :token="token" />

    <div v-if="! tokens.length">
      No tokens yet
    </div>
  </PageFrame>
</template>

<script setup>
const id = useArtistId()

const props = defineProps(['collection'])
const collection = computed(() => props.collection)
const store = useOnchainStore()
const ownedByMe = useIsMeCheck(collection.value.owner)

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
