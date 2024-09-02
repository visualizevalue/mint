<template>
  <section>
    <h1>Mint Timeline</h1>

    <div class="table">
      <TokenMintTimelineItem
        v-for="mint of mints" :mint="mint"
        :key="mint.tx"
        :block="currentBlock"
      />
      <div v-if="! loading">
        <span>
          <Account :address="collection.owner" />
        </span>

        <span class="right">1<span class="muted-light">×</span></span>
        <span class="right">Artist Mint</span>

        <span class="right"><BlocksTimeAgo v-if="currentBlock" :blocks="currentBlock - (token.untilBlock - 7200n)" /></span>

        <span class="right muted-light">
          <NuxtLink :to="`${config.public.blockExplorer}/nft/${token.collection}/${token.tokenId}`" target="_blank">
            <Icon type="link" />
          </NuxtLink>
        </span>
      </div>
    </div>

    <Loading v-if="loading" txt="mint history..." />
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

<style lang="postcss" scoped>
section {
  padding-top: var(--spacer-lg) !important;
  padding-bottom: var(--spacer-lg) !important;
  container-type: inline-size;
}

h1 {
  margin-bottom: var(--spacer);
  font-size: var(--font-base);
  border-bottom: var(--border);
  padding: 0 0 var(--spacer-sm);
  margin: 0 0 var(--spacer-lg);
}

.table {
  display: grid;
  gap: var(--spacer);

  :deep(> div) {
    display: grid;
    gap: var(--spacer);

    .right {
      text-align: right;
    }

    span {
      white-space: nowrap;

      &:nth-child(3) {
        display: none;

        @container (min-width: 30rem) {
          display: inline;
        }
      }
    }

    grid-template-columns: 6rem 3rem 1fr 3rem;

    @container (min-width: 30rem) {
      grid-template-columns: 6rem 3rem 1fr 6rem 1rem;
    }
  }
}
</style>
