<template>
  <section class="token-mint-timeline">
    <slot :mints="mints" :loading="loading">
      <h1>{{ $t('token.mint_timeline') }}</h1>

      <template v-if="currentBlock">
      <TokenMintTimelineVirtualScroller
        :mints="mints"
        :block="currentBlock"
      >
        <template #after>
          <TokenMintTimelineItem v-if="backfillComplete">
            <Account :address="collection.owner" class="account" />

            <span class="amount">1<span>×</span></span>
            <span class="price">{{ $t('token.artist_mint')}}</span>

            <span class="time-ago"><BlocksTimeAgo v-if="currentBlock" :blocks="currentBlock - mintedAtBlock" /></span>

            <span class="links">
              <NuxtLink :to="`${config.public.blockExplorer}/nft/${token.collection}/${token.tokenId}`" target="_blank">
                <Icon type="link" />
              </NuxtLink>
            </span>
          </TokenMintTimelineItem>
        </template>
      </TokenMintTimelineVirtualScroller>
      </template>

      <div v-if="! backfillComplete" v-show="! loading" ref="loadMore" class="load-more">
        <Button @click="backfill">{{ $t('token.load_more')}}</Button>
      </div>

      <Loading v-if="loading || ! currentBlock" :txt="$t('token.loading_mint_history')" />
    </slot>
  </section>
</template>

<script setup>
import { useElementVisibility } from '@vueuse/core'
import { useBlockNumber } from '@wagmi/vue'

const config = useRuntimeConfig()
const { data: currentBlock } = useBlockNumber({ chainId: config.public.chainId })

const { token, collection } = defineProps({
  token: Object,
  collection: Object,
})

const state = useOnchainStore()

const mints = computed(() => state.tokenMints(token.collection, token.tokenId))
const mintedAtBlock = computed(() => token.untilBlock - MINT_BLOCKS)
const backfillComplete = computed(() => token.mintsBackfilledUntilBlock <= mintedAtBlock.value)

const loading = ref(true)
const loadMore = ref()
const loadMoreVisible = useElementVisibility(loadMore)
const backfill = async () => {
  loading.value = true

  try {
    await state.backfillTokenMints(token)

    // If we're not fully backfilled and we have less than 20 mints loaded,
    // continue backfilling events.
    while (! backfillComplete.value && mints.value?.length < 20) {
      await delay(250)
      await state.backfillTokenMints(token)
    }
  } catch (e) {
    console.error(`Issue during backfill`, e)
  }

  loading.value = false
}

onMounted(async () => {
  loading.value = true
  try {
    console.info(`Attempting to load + backfill token mints for #${token.tokenId}`)
    await state.fetchTokenMints(token)
    await backfill()
  } catch (e) {
    console.error(e)
  }
  loading.value = false
})

watch(loadMoreVisible, () => {
  // Skip if we have enough mints for the viewport or we're already loading
  if (! loadMoreVisible.value || loading.value) return

  backfill()
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

h1 {
  margin-bottom: var(--spacer);
  font-size: var(--font-base);
  border-bottom: var(--border);
  padding: 0 0 var(--spacer);
  margin: 0 0 var(--spacer);
}


.load-more {
  .button {
    display: block;
    width: 100%;
  }
}
</style>
