<template>
  <PageFrame :title="breadcrumb">
    <ProfileHeader :address="id" />

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
menu {
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: flex-end;
  gap: var(--spacer);
}
</style>
