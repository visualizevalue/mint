<template>
  <PaginatedContent
    :url="url"
    :query="query"
    :sync-initial="false"
    tag="section"
    class="no-scroller timeline"
  >
    <template #default="{ items }">
      <slot :items="items">
        <VirtualScroll
          v-if="items?.length"
          :items="items"
          :min-item-size="256"
        >
          <template #default="{ item: post }">
            <Post :key="post.id" :post="post" />
          </template>
        </VirtualScroll>
      </slot>
    </template>
    <template #empty>
      <slot name="empty">
        <p class="empty">No posts</p>
      </slot>
    </template>
  </PaginatedContent>
</template>

<script setup>
const props = defineProps({
  creatorId: Number,
  practiceId: String,
})

const config = useRuntimeConfig()
const url = `${config.public.api}/posts`
const query = computed(() => {
  const q = new URLSearchParams({
    limit: 8,
    sort: '-createdAt',
  })

  if (props.creatorId) q.append('filter[creatorId]', props.creatorId)
  if (props.practiceId) q.append('filter[practiceId]', props.practiceId)

  return q.toString()
})
</script>

<style lang="postcss">
.timeline {
  width: 100%;
  container-type: inline-size;
  container-name: timeline;
  padding: 0 var(--spacer) !important;

  @media (--md) {
    padding: 0 var(--spacer-lg) !important;
  }

  .post {
    padding: var(--spacer-lg) 0;
  }

  .empty {
    color: var(--muted);
  }
}
</style>

<style lang="postcss" scoped>
.empty {
  color: var(--muted);
  font-family: var(--font-family-ui);
  font-size: var(--font-sm);
  text-transform: uppercase;
}
</style>
