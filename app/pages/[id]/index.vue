<template>
  <Loading v-if="loading" />
  <PageFrame v-else>
    <header v-if="isMe">
      <h1>Your Collections</h1>
      <menu>
        <Button :to="`/${id}/create`">Create New</Button>
        <Button :to="`/${id}/add`">Add Existing</Button>
      </menu>
    </header>

    <section v-if="collections.length">
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
        <Button :to="`/${id}/${collection.address}`">View</Button>
      </article>
    </section>
    <section v-else>
      <template v-if="isMe">
        <p>It looks like you haven't deployed any collections.</p>
        <Button :to="`${id}/create`">Create your first</Button>
      </template>
      <template v-else>
        <p>It looks like this account hasn't deployed any collections.</p>
      </template>
    </section>
  </PageFrame>
</template>

<script setup>
const store = useOnchainStore()
const id = useArtistId()

const { loading } = useScopedOnchainData()
const collections = computed(() => store.forArtist(id.value))

const isMe = useIsMe()
</script>

<style lang="postcss" scoped>
menu {
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: flex-end;
  gap: var(--spacer);
}
</style>
