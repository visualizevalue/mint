<template>
  <PageFrame :title="breadcrumb">
    <ProfileHeader :address="id" />

    <CollectionsOverview :id="id">
      <template #before="{ collections }">
        <Header v-if="collections.length">
          <h1>Your Collections</h1>
          <Actions>
            <Button :to="{ name: `id-create`, params: { id } }" class="small">
              <Icon type="plus" />
              <span>Collection</span>
            </Button>
          </Actions>
        </Header>
      </template>
    </CollectionsOverview>
  </PageFrame>
</template>

<script setup>
const id = useArtistId()
const isMe = useIsMe()
const artistName = useAccountName(id.value)
const subdomain = useSubdomain()

const breadcrumb = computed(() => {
  if (subdomain.value || isMe.value) {
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
