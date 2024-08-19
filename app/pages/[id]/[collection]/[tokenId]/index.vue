<template>
  <Loading v-if="! token" />
  <PageFrame v-else :title="breadcrumb">
    <article>
      <h1>{{ token.name }} #{{ token.tokenId }}</h1>
      <img :src="token.artifact" :alt="token.name">
      <p>{{ token.description }}</p>

      <div>
        <p v-if="mintOpen">Current Block: {{ currentBlock }}</p>

        <p v-if="mintOpen">Mint open ({{ blocksRemaining }} blocks; <CountDown :until="until" minimal class="inline" />)</p>
        <p v-else>Mint closed at block {{ token.untilBlock }}</p>

        <p v-if="isConnected">Owned: {{ ownedBalance }}</p>
      </div>
    </article>

    <MintToken v-if="mintOpen" :token="token" />
  </PageFrame>
</template>

<script setup>
import { useAccount, useBlockNumber } from '@wagmi/vue'

const id = useArtistId()
const route = useRoute()
const isMe = useIsMe()
const subdomain = useSubdomain()
const artistName = useAccountName(id.value)
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
    return navigateTo({ name: 'id-collection', params: { id: id.value, collection: collection.value.address }})
  }

  if (! token.value) await store.fetchToken(collection.value.address, tokenId.value)

  await maybeCheckBalance()
})

const breadcrumb = computed(() => {
  const path = subdomain.value || isMe.value ? [] : [
    {
      text: artistName,
      to: { name: 'id', params: { id: id.value } }
    }
  ]

  return [
    ...path,
    {
      text: `${ collection.value.name }`,
      to: { name: 'id-collection', params: { id: id.value, collection: collection.value.address } }
    },
    {
      text: `${ token.value.name } #${ tokenId.value }`
    },
  ]
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
