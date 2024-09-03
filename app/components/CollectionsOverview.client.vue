<template>
  <section v-if="collections.length" class="collections borderless">
    <slot name="before" :collections="collections" />

    <CollectionOverviewCard
      v-for="collection in collections"
      :key="collection.address"
      :collection="collection"
    />
  </section>
  <section v-else-if="! loading" class="centered borderless">
    <template v-if="isMe">
      <p>It looks like you haven't deployed any collections.</p>
      <div>
        <Button :to="{ name: `id-create`, params: { id } }">
          <Icon type="plus" />
          <span>Create Your First</span>
        </Button>
      </div>
    </template>
    <template v-else>
      <p>It looks like this account hasn't deployed any collections.</p>
    </template>
  </section>
  <Loading v-if="loading" txt="Querying the blockchain..." />
</template>

<script setup>
const store = useOnchainStore()

const { id } = defineProps({
  id: String,
})

const isMe = useIsMeCheck(id)

const { loading } = useLoadArtistData(id)
const collections = computed(() => isMe.value
  ? store.forArtist(id)
  : store.forArtistOnlyMinted(id)
)

// Force update collections with no mints
if (store.forArtist(id).length !== collections.length) {
  store.forArtist(id)
    .filter(c => c.latestTokenId === 0n)
    .forEach(c => store.fetchCollection(c.address))
}
</script>

<style lang="postcss" scoped>
.collections {
  display: grid;
  gap: var(--spacer-lg);
  padding: var(--spacer-lg) var(--spacer) !important;
}
</style>
