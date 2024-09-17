<template>
  <PageFrame :title="breadcrumb">
    <ArtistDetail />
  </PageFrame>
</template>

<script setup>
const id = useArtistId()
const store = useOnchainStore()

const appTitle = useAppTitle()
const hideArtist = useHideArtistInHeader()
const breadcrumb = computed(() => {
  if (hideArtist.value) return []

  return [
    {
      text: store.displayName(id.value)
    }
  ]
})

useMetaData({
  title: hideArtist.value ? appTitle.value : store.displayName(id.value),
})
</script>

