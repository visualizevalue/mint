<template>
  <PageFrame :title="[
    {
      text: `Collections`,
      to: `/${id}`
    },
    {
      text: `${ collection?.name }`
    }
  ]">
    <header v-if="isMe">
      <menu>
        <Button :to="`/${id}/${collection.address}/mint`">Create New</Button>
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
      </article>

      <div v-if="! tokens.length">
        No tokens yet
      </div>
    </section>
  </PageFrame>
</template>

<script setup>
const id = useArtistId()
const isMe = useIsMe()

const props = defineProps(['collection'])
const collection = computed(() => props.collection)
const store = useOnchainStore()

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
