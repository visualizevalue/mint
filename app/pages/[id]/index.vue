<template>
  <PageFrame :title="breadcrumb">
    <ProfileHeader :address="id" />

    <CollectionsOverview :id="id">
      <template #before="{ collections }">
        <HeaderSection v-if="isMe && collections.length">
          <h1>Your Collections</h1>
          <Actions>
            <Button :to="{ name: `id-create`, params: { id } }" class="small">
              <Icon type="plus" />
              <span>Collection</span>
            </Button>
          </Actions>
        </HeaderSection>
      </template>
    </CollectionsOverview>
  </PageFrame>
</template>

<script setup>
const id = useArtistId()
const isMe = useIsMe()
const artistName = useAccountName(id.value)
const scope = useArtistScope()

const breadcrumb = computed(() => {
  if (scope || isMe.value) {
    return []
  }

  return [
    {
      text: artistName.value
    }
  ]
})

useMetaData({
  title: artistName.value,
})
</script>

<style lang="postcss" scoped>
</style>
