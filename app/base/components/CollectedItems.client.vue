<template>
  <section v-if="ownerships.length" class="collected-items">
    <slot name="before" :ownerships="ownerships" />

    <div class="collected-items-grid">
      <CollectedItemCard
        v-for="ownership in ownerships"
        :key="`${ownership.artifact.collection.address}-${ownership.artifact.id}`"
        :artifact="ownership.artifact"
      />
    </div>

    <div ref="loadMoreTrigger" class="load-more-trigger">
      <Loading v-if="loadingMore" :txt="$t('collected.loading')" />
    </div>
  </section>
  <section v-else-if="! loading" class="collected-items-empty">
    <slot name="before" :ownerships="[]" />
    <template v-if="isMe">
      <p>{{ $t('collected.empty') }}</p>
    </template>
    <template v-else>
      <p>{{ $t('collected.empty_other') }}</p>
    </template>
  </section>
  <section v-else>
    <slot name="before" :ownerships="[]" />
    <Loading :txt="$t('collected.loading')" />
  </section>
</template>

<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import type { Ownership } from '~/utils/types'

interface PageInfo {
  hasNextPage: boolean
  endCursor: string | null
}

interface OwnershipsResponse {
  data: {
    ownerships: {
      items: Ownership[]
      pageInfo: PageInfo
      totalCount: number
    }
  }
  errors?: Array<{ message: string }>
}

const props = defineProps<{
  id: string
}>()

const id = computed(() => props.id)
const isMe = useIsMeCheck(id)
const endpoints = useIndexerEndpoints()
const artistScope = useArtistScope()
const store = useOnchainStore()

const scopedCollections = computed(() => {
  if (!artistScope) return null
  const collections = store.forArtist(artistScope as `0x${string}`)
  return collections.map(c => c.address)
})

const ownerships = ref<Ownership[]>([])
const hasNextPage = ref(false)
const endCursor = ref<string | null>(null)
const loading = ref(true)
const loadingMore = ref(false)
const loadMoreTrigger = ref<HTMLElement | null>(null)

const buildQuery = (cursor?: string | null) => {
  const filters = [`account: "${props.id}"`, `balance_gt: "0"`]

  if (scopedCollections.value && scopedCollections.value.length > 0) {
    const addresses = scopedCollections.value.map(a => `"${a}"`).join(', ')
    filters.push(`collection_in: [${addresses}]`)
  }

  return `
    query Ownerships {
      ownerships(
        where: { ${filters.join(', ')} }
        limit: 24
        orderBy: "created_at"
        orderDirection: "desc"
        ${cursor ? `after: "${cursor}"` : ''}
      ) {
        items {
          artifact {
            id
            name
            image
            collection {
              address
              owner
              name
            }
          }
          balance
          created_at
          updated_at
        }
        pageInfo {
          hasNextPage
          endCursor
        }
        totalCount
      }
    }
  `
}

const fetchOwnerships = async (cursor?: string | null): Promise<OwnershipsResponse['data']['ownerships']> => {
  let lastError: Error | undefined
  for (const endpoint of endpoints.value) {
    try {
      const response = await $fetch<OwnershipsResponse>(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { query: buildQuery(cursor) },
      })

      if (response.errors) {
        throw new Error(response.errors[0].message)
      }

      return response.data.ownerships
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e))
    }
  }
  throw lastError ?? new Error('All indexer endpoints failed')
}

const loadInitial = async () => {
  loading.value = true
  try {
    const result = await fetchOwnerships()
    ownerships.value = result.items
    hasNextPage.value = result.pageInfo.hasNextPage
    endCursor.value = result.pageInfo.endCursor
  } catch (e) {
    console.error('Failed to load ownerships:', e)
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (!hasNextPage.value || loadingMore.value) return

  loadingMore.value = true
  try {
    const result = await fetchOwnerships(endCursor.value)
    ownerships.value = [...ownerships.value, ...result.items]
    hasNextPage.value = result.pageInfo.hasNextPage
    endCursor.value = result.pageInfo.endCursor
  } catch (e) {
    console.error('Failed to load more ownerships:', e)
  } finally {
    loadingMore.value = false
  }
}

useIntersectionObserver(
  loadMoreTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting && hasNextPage.value && !loadingMore.value) {
      loadMore()
    }
  },
  {
    rootMargin: '100px',
    threshold: 0.1,
  },
)

// In single-artist mode, wait for scoped collections to resolve before fetching.
// Otherwise, fetch immediately.
if (artistScope) {
  const unwatch = watch(scopedCollections, (collections) => {
    if (collections && collections.length > 0) {
      loadInitial()
      nextTick(() => unwatch())
    }
  }, { immediate: true })
} else {
  onMounted(() => loadInitial())
}
</script>

<style scoped>
.collected-items {
  display: grid;
  gap: var(--spacer-lg);
  padding: var(--spacer-lg) var(--spacer);
}

.collected-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: var(--spacer);
}

.collected-items-empty {
  display: grid;
  gap: var(--spacer);
}

.load-more-trigger {
  min-height: 1px;
}
</style>
