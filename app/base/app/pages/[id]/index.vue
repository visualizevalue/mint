<template>
  <PageFrame :title="breadcrumb">
    <ProfileHeader :address="id" />

    <CollectionsOverview :id="id" :key="`${isMe}-${id}`">
      <template #before="{ collections }">
        <HeaderSection v-if="isMe && collections.length">
          <h1>Your Collections</h1>
          <Actions>
            <ButtonAddCollection :id="id" />
          </Actions>
        </HeaderSection>
      </template>
    </CollectionsOverview>
  </PageFrame>
</template>

<script setup>
const id = useArtistId()
const isMe = useIsMe()
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

