<template>
  <aside class="mint-select-renderer">
    <select
      class="select"
      v-model="selection"
    >
      <option
        v-for="( renderer, index ) in collection.renderers"
        :value="index"
        :title="renderer.name"
      >{{ renderer.name }}</option>
      <option disabled>----</option>
      <option value="new">Install New</option>
    </select>
  </aside>
</template>

<script setup>
const { collection } = defineProps(['collection'])
const id = useArtistId()

const store = useOnchainStore()
onMounted(() => store.fetchCollectionRenderers(collection.address))

const { renderer, reset } = useCreateMintData()
const selection = ref(renderer.value)
watch(selection, () => {
  if (selection.value === 'new') {
    return navigateTo({ name: 'id-collection-renderers', params: { id: id.value, collection: collection.address } })
  }

  renderer.value = selection.value

  reset()
})
</script>

<style scoped>
.mint-select-renderer {
  display: grid;
  gap: var(--spacer);

  @media (--md) {
    display: flex;
    justify-content: space-between;

    .select {
      width: fit-content;
    }
  }
}
</style>
