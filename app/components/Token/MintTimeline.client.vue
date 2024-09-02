<template>
  <section>
    <h1>Mint Timeline</h1>

    <div class="table">
      <TokenMintTimelineItem
        v-for="mint of mints" :mint="mint"
        :key="mint.tx"
        :block="currentBlock"
      />
    </div>

    <Loading v-if="loading" txt="mint history..." />
  </section>
</template>

<script setup>
import { useBlockNumber } from '@wagmi/vue'

const config = useRuntimeConfig()
const { data: currentBlock } = useBlockNumber({ chainId: config.public.chainId })

const { token } = defineProps({
  token: Object,
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
</script>

<style lang="postcss" scoped>
section {
  padding-top: var(--spacer-lg) !important;
  padding-bottom: var(--spacer-lg) !important;
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
}
</style>
