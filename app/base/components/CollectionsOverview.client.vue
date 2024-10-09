<template>
  <section v-if="collections.length" class="collections-overview">
    <slot name="before" :collections="collections" />

    <CollectionOverviewCard
      v-for="collection in collections"
      :key="collection.address"
      :collection="collection"
    />
  </section>
  <section v-else-if="! loading" class="collections-overview-empty">
    <template v-if="isMe">
      <p>{{ $t('collections_overview.no_collections') }}</p>
      <div>
        <Button :to="{ name: `id-create`, params: { id } }">
          <Icon type="plus" />
          <span>{{ $t('collections_overview.create_first') }}</span>
        </Button>
      </div>
    </template>
    <template v-else>
      <p>{{ $t('collections_overview.no_collections_other') }}</p>
    </template>
  </section>
  <Loading v-if="loading" :txt="$t('collections_overview.querying_blockchain')" />
</template>

<script setup>
const store = useOnchainStore()

const props = defineProps({
  id: String,
})
const id = computed(() => props.id)

const isMe = useIsMeCheck(id)

const { loading } = useLoadArtistData(id)
const collections = computed(() => isMe.value
  ? store.forArtist(id.value)
  : store.forArtistOnlyMinted(id.value)
)

// Force update collections with no mints
if (store.forArtist(id.value).length !== collections.length) {
  store.forArtist(id.value)
    .filter(c => c.latestTokenId === 0n)
    .forEach(c => store.fetchCollection(c.address))
}
</script>

<style scoped>
.collections-overview {
  display: grid;
  gap: var(--spacer-lg);
  padding: var(--spacer-lg) var(--spacer);
}

.collections-overview-empty {
  display: grid;
  gap: var(--spacer);
}
</style>
