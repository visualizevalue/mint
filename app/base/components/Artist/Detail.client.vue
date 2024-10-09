<template>
  <slot name="before" />

  <ProfileHeader :address="id" />

  <CollectionsOverview :id="id" :key="`${isMe}-${id}`">
    <template #before="{ collections }">
      <HeaderSection v-if="isMe && collections.length">
        <h1>{{ $t('profile.your_collections') }}</h1>
        <Actions>
          <ButtonAddCollection :id="id" />
        </Actions>
      </HeaderSection>
    </template>
  </CollectionsOverview>

  <slot name="after" />
</template>

<script setup>
const id = useArtistId()
const isMe = useIsMe()
</script>

