<template>
  <Authenticated>
    <PageFrame :title="breadcrumb" class="inset wide">
      <MintDetail :collection="collection" />
    </PageFrame>
  </Authenticated>
</template>

<script setup>
const props = defineProps(['collection'])
const id = useArtistId()
const store = useOnchainStore()
const collection = computed(() => props.collection)
const subdomain = useSubdomain()
const isMe = useIsMe()

const breadcrumb = computed(() => {
  const path = subdomain.value || isMe.value ? [] : [
    {
      text: store.displayName(id.value),
      to: { name: 'id', params: { id: id.value } }
    }
  ]

  return [
    ...path,
    {
      text: `${ collection.value.name }`,
      to: { name: 'id-collection', params: { id: id.value, collection: collection.value.address } }
    },
    {
      text: `New Mint`
    },
  ]
})

useMetaData({
  title: `Mint New Token | ${collection.value.name}`,
})
</script>

