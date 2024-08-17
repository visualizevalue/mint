<template>
  <PageFrame>
    <ClientOnly>
      <header v-if="isMe">
        <h1>Your Collections</h1>
        <menu>
          <Button :to="{ name: `id-create`, params: { id } }">New Collection</Button>
        </menu>
      </header>
    </ClientOnly>

    <CollectionsOverview :id="id" />
  </PageFrame>
</template>

<script setup>
const id = useArtistId()
const isMe = useIsMe()
const store = useOnchainStore()

const collections = computed(() => store.forArtist(id.value))

const autoNavigateToCollection = () => {
  if (collections.value?.length === 1) {
    navigateTo({ name: 'id-collection', params: { id: id.value, collection: collections.value[0].address } })
  }
}
watch(() => collections.value?.length, () => autoNavigateToCollection())
onMounted(() => autoNavigateToCollection())
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
