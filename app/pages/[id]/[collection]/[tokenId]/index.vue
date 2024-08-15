<template>
  <Loading v-if="! token" />
  <PageFrame v-else :title="[
    {
      text: `Collections`,
      to: `/${id}`
    },
    {
      text: `${ collection.name }`,
      to: `/${id}/${collection.address}`
    },
    {
      text: `${ token.name } #${ $route.params.tokenId }`
    }
  ]">
    <article>
      <h1>{{ token.name }} #{{ token.tokenId }}</h1>
      <img :src="token.artifact" :alt="token.name">
      <p>{{ token.description }}</p>

      <div>
        <p v-if="mintOpen">Mint open ({{ blocksRemaining }} blocks; <CountDown :until="until" minimal class="inline" />)</p>
        <p>Current Block: {{ currentBlock }}</p>
        <p v-if="isConnected">Owned: {{ ownedBalance }}</p>
      </div>
    </article>
  </PageFrame>
</template>

<script setup>
import { useAccount, useBlockNumber } from '@wagmi/vue'

const id = useArtistId()
const route = useRoute()
const { address, isConnected } = useAccount()
const props = defineProps(['collection'])
const collection = computed(() => props.collection)
const tokenId = computed(() => BigInt(route.params.tokenId))
const store = useOnchainStore()

const token = computed(() => collection.value.tokens[route.params.tokenId])
const { data: currentBlock } = useBlockNumber()
const mintOpen = computed(() => token.value.untilBlock > currentBlock.value)
const blocksRemaining = computed(() => token.value.untilBlock - currentBlock.value)
const secondsRemaining = computed(() => blocksToSeconds(blocksRemaining.value))
const until = computed(() => nowInSeconds() + secondsRemaining.value)

// Keep track of account token balance
const ownedBalance = computed(() => store.tokenBalance(collection.value.address, token.value.tokenId))
const maybeCheckBalance = async (force = false) => {
  if (isConnected.value && (ownedBalance.value === null || force)) {
    await store.fetchTokenBalance(token.value, address.value)
  }
}
watch(isConnected, () => maybeCheckBalance(true))

// Navigation guards
onMounted(async () => {
  if (collection.value.latestTokenId < tokenId.value) {
    return navigateTo(`/${id.value}/${collection.value.address}`)
  }

  if (! token.value) await store.fetchToken(collection.value.address, tokenId.value)

  await maybeCheckBalance()
})
</script>

<style lang="postcss" scoped>
  article {
    padding: 1rem;

    h1 {
      font-size: 1.25rem;
    }

    p {
      color: gray;
    }
  }
</style>
