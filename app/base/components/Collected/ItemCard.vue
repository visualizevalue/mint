<template>
  <article class="collected-item-card">
    <Image
      v-if="artifact.image"
      :src="artifact.image"
      :alt="artifact.name"
      :aspect-ratio="1"
    />
    <ImageVoid v-else />
    <CardLink
      :to="{
        name: 'id-collection-tokenId',
        params: {
          id: artifact.collection.owner,
          collection: artifact.collection.address,
          tokenId: `${artifact.id}`,
        },
      }"
    >{{ $t('token.view') }} {{ artifact.name }}</CardLink>
  </article>
</template>

<script setup lang="ts">
import type { OwnershipArtifact } from '~/utils/types'

defineProps<{
  artifact: OwnershipArtifact
}>()
</script>

<style scoped>
.collected-item-card {
  position: relative;

  :deep(a) {
    z-index: 2;
  }
}
</style>
