<template>
  <!-- TODO: maybe reenable -->
  <!-- <section v-else-if="unwrapMainCollection">
    <slot name="before" :collections="collections" />

    <section class="collections">
      <CollectionOverviewCard :collection="mainCollection" />

      <TokenOverviewCard v-for="token of mainCollectionTokens" :key="token.tokenId" :token="token" />
    </section>
  </section> -->
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
          <span>Create your first</span>
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

// const unwrapMainCollection = computed(() => collections.value.length === 1)
// const mainCollection = computed(() => collections.value[0])
// const mainCollectionTokens = computed(() => store.tokens(mainCollection.value.address))
// const maybeLoadMainCollectionTokens = () => unwrapMainCollection.value && store.fetchCollectionTokens(mainCollection.value.address)
// onMounted(() => maybeLoadMainCollectionTokens())
// watch(unwrapMainCollection, () => maybeLoadMainCollectionTokens())
</script>

<style lang="postcss" scoped>
.collections {
  display: grid;
  gap: var(--spacer-lg);
  padding: var(--spacer-lg) var(--spacer) !important;
}
</style>
