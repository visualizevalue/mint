<template>
  <section class="token-mint-timeline">
    <slot :mints="sortedMints" :loading="loading">
      <header class="timeline-header">
        <h1>{{ $t('token.mint_timeline') }}</h1>

        <menu class="sort-options">
          <button :class="{ active: sortBy === 'recent' }" @click="sortBy = 'recent'">{{ $t('token.sort_recent') }}</button>
          <button :class="{ active: sortBy === 'amount' }" @click="sortBy = 'amount'">{{ $t('token.sort_amount') }}</button>
        </menu>
      </header>

      <template v-if="currentBlock">
      <TokenMintTimelineVirtualScroller
        :mints="sortedMints"
        :block="currentBlock"
      >
        <template #after>
          <TokenMintTimelineItem>
            <Account :address="collection.owner" class="account" />

            <span class="amount">1<span>×</span></span>
            <span class="price">{{ $t('token.artist_mint')}}</span>

            <span class="time-ago"><BlocksTimeAgo v-if="currentBlock" :blocks="currentBlock - token.mintedBlock" /></span>

            <span class="links">
              <NuxtLink :to="`${config.public.blockExplorer}/nft/${token.collection}/${token.tokenId}`" target="_blank">
                <Icon type="link" />
              </NuxtLink>
            </span>
          </TokenMintTimelineItem>
        </template>
      </TokenMintTimelineVirtualScroller>
      </template>

      <Loading v-if="loading || ! currentBlock" :txt="$t('token.loading_mint_history')" />
    </slot>
  </section>
</template>

<script setup>
import { useBlockNumber } from '@wagmi/vue'

const config = useRuntimeConfig()
const { data: currentBlock } = useBlockNumber({ chainId: config.public.chainId })

const { token, collection } = defineProps({
  token: Object,
  collection: Object,
})

const state = useOnchainStore()

const mints = computed(() => state.tokenMints(token.collection, token.tokenId))

const sortBy = ref('recent')
const sortedMints = computed(() => {
  if (!mints.value) return []
  if (sortBy.value === 'recent') return mints.value
  const sorted = [...mints.value]
  if (sortBy.value === 'amount') {
    sorted.sort((a, b) => (a.amount > b.amount ? -1 : a.amount < b.amount ? 1 : 0))
  }
  return sorted
})

const loading = ref(true)

onMounted(async () => {
  loading.value = true
  try {
    await state.fetchTokenMints(token)
  } catch (e) {
    console.error(e)
  }
  loading.value = false
})

watch(currentBlock, () => {
  if (loading.value) return

  state.fetchTokenMints(token)
})
</script>

<style scoped>
.token-mint-timeline {
  padding-top: var(--spacer-lg);
  padding-bottom: var(--spacer-lg);
  container-type: inline-size;

  :deep(.token-mint-timeline-items) {
    display: grid;
    gap: var(--spacer);
  }
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacer);
  border-bottom: var(--border);
  padding: 0 0 var(--spacer);
  margin: 0 0 var(--spacer);

  h1 {
    font-size: var(--font-base);
    margin: 0;
    padding: 0;
  }
}

.sort-options {
  display: flex;
  gap: var(--spacer-sm);
  padding: 0;
  margin: 0;

  button {
    font-size: var(--font-sm);
    color: var(--muted);
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;

    &.active {
      color: var(--color);
    }

    &:--highlight {
      color: var(--color);
    }
  }
}

</style>
