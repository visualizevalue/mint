<template>
  <section class="token-mint-timeline">
    <h1>Mint Timeline</h1>

    <div v-if="currentBlock" class="token-mint-timeline-items">
      <TokenMintTimelineItem
        v-for="mint of mints"
        :mint="mint"
        :key="mint.tx"
        :block="currentBlock"
      />
      <TokenMintTimelineItem v-if="! loading || mints.length">
        <Account :address="collection.owner" class="account" />

        <span class="amount">1<span>×</span></span>
        <span class="price">Artist Mint</span>

        <span class="time-ago"><BlocksTimeAgo v-if="currentBlock" :blocks="currentBlock - (token.untilBlock - 7200n)" /></span>

        <span class="links">
          <NuxtLink :to="`${config.public.blockExplorer}/nft/${token.collection}/${token.tokenId}`" target="_blank">
            <Icon type="link" />
          </NuxtLink>
        </span>
      </TokenMintTimelineItem>
    </div>

    <Loading v-if="loading || ! currentBlock" txt="Mint History..." />
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

const loading = ref(false)
onMounted(async () => {
  loading.value = true
  try {
    await state.fetchTokenMints(token)
    await state.backfillTokenMints(token)
  } catch (e) {
    console.error(e)
  }
  loading.value = false
})

watch(currentBlock, () => state.fetchTokenMints(token))
</script>

<style scoped>
.token-mint-timeline {
  padding-top: var(--spacer-lg);
  padding-bottom: var(--spacer-lg);
  container-type: inline-size;
}

h1 {
  margin-bottom: var(--spacer);
  font-size: var(--font-base);
  border-bottom: var(--border);
  padding: 0 0 var(--spacer-sm);
  margin: 0 0 var(--spacer);
}

.token-mint-timeline-items {
  display: grid;
  gap: var(--spacer);
}
</style>
