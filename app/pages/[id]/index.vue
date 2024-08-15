<template>
  <PageFrame>
    <header v-if="isMe">
      <h1>Your Collections</h1>
      <menu>
        <Button :to="`/${id}/create`">New Collection</Button>
      </menu>
    </header>

    <CollectionsOverview :id="id" />
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
