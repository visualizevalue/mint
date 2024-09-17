<template>
  <PageFrame :title="breadcrumb">
    <CollectionDetail :collection="collection" />
  </PageFrame>
</template>

<script setup>
const props = defineProps(['collection'])
const collection = computed(() => props.collection)
const id = useArtistId()
const store = useOnchainStore()

const hideArtist = useHideArtistInHeader()
const breadcrumb = computed(() => {
  const path = hideArtist.value ? [] : [
    {
      text: store.displayName(id.value),
      to: { name: 'id', params: { id } }
    }
  ]

  return [
    ...path,
    {
      text: collection.value.name || 'Unnamed Collection'
    }
  ]
})

useMetaData({
  title: `${collection.value.name}`,
})
</script>

