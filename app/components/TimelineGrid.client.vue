<template>
  <div class="grid" ref="grid">
    <Timeline
      :creator-id="creatorId"
      :practice-id="practiceId"
    >
      <template #default="{ items }">
        <VirtualScrollGrid
          v-if="items?.length"
          :items="items"
          :grid-items="gridItems"
          :item-size="itemSize"
        >
          <template #default="{ item: post }">
            <NuxtLink :to="`/posts/${post.id}/0`" :key="post.id">
              <Image
                :image="post.attachments[0]"
              />
            </NuxtLink>
          </template>
        </VirtualScrollGrid>
      </template>
    </Timeline>
  </div>
</template>

<script setup>
import { useElementSize } from '@vueuse/core'

defineProps({
  creatorId: Number,
  practiceId: String,
})

const grid = ref()
const { width: gridWidth } = useElementSize(grid)
const gridItems = computed(() => gridWidth.value > 800
  ? 4
  : gridWidth.value > 600
    ? 3
    : gridWidth.value > 300
      ? 2
      : 1
)
const itemSize = computed(() => gridWidth.value / gridItems.value)
</script>

<style lang="postcss" scoped>
.grid:not(:has(> .empty)) {
  padding: 0 !important;

  :deep(.timeline) {
    padding: 0 !important;
  }
}
</style>
