<template>
  <PageFrame>
    <ProfileHeader :address="id" />

    <CollectionsOverview :id="id">
      <template #before>
        <header v-if="isMe">
          <h1>Your Collections</h1>
          <menu>
            <Button :to="{ name: `id-create`, params: { id } }">New Collection</Button>
          </menu>
        </header>
      </template>
    </CollectionsOverview>
  </PageFrame>
</template>

<script setup>
const id = useArtistId()
const isMe = useIsMe()
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
