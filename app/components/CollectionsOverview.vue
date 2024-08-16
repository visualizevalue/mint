<template>
  <Loading v-if="loading" />
  <section v-else-if="collections.length">
    <article
      v-for="collection in collections"
      :key="collection.address"
    >
      <img v-if="collection.image" :src="collection.image" :alt="collection.name">
      <h1>{{ collection.name }} <small>{{ collection.symbol }}</small></h1>
      <p>{{ collection.description }}</p>
      <p>Init Block: {{ collection.initBlock }}</p>
      <p>Latest Token: {{ collection.latestTokenId }}</p>
      <p>Owner: {{ collection.owner }}</p>
      <Button :to="{ name: 'id-collection', params: { id, collection: collection.address } }">View</Button>
    </article>
  </section>
  <section v-else>
    <template v-if="isMe">
      <p>It looks like you haven't deployed any collections.</p>
      <Button :to="{ name: `id-create`, params: { id } }">Create your first</Button>
    </template>
    <template v-else>
      <p>It looks like this account hasn't deployed any collections.</p>
    </template>
  </section>
</template>

<script setup>
const store = useOnchainStore()

const { id } = defineProps({
  id: String,
})

const isMe = useIsMeCheck(id)

const { loading } = useLoadArtistData(id)
const collections = computed(() => store.forArtist(id))
</script>
