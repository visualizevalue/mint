<template>
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
</template>

<script setup>
const id = useArtistId()
const isMe = useIsMe()
</script>

