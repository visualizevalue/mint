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

    <section>
      <img v-if="collection.image" :src="collection.image" :alt="collection.name">
      <h1>{{ collection.name }} <small>{{ collection.symbol }}</small></h1>
      <p>{{ collection.description }}</p>
      <p>Init Block: {{ collection.initBlock }}</p>
      <p>Latest Token: {{ collection.latestTokenId }}</p>
      <p>Owner: {{ collection.owner }}</p>
    </section>

    <section>
      <article v-for="token of tokens" :key="token.tokenId">
        <h1>{{ token.name }} #{{ token.tokenId }}</h1>
        <img :src="token.artifact" :alt="token.name">
        <p>{{ token.description }}</p>
        <Button
          :to="{
            name: 'id-collection-tokenId',
            params: { id, collection: collection.address, tokenId: token.tokenId }
          }"
        >View {{ token.name }}</Button>
      </article>

      <div v-if="! tokens.length">
        No tokens yet
      </div>
    </section>
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
