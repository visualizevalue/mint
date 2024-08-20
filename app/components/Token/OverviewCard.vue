<template>
  <article class="token">
    <HeaderSection>
      <h1>
        <span>{{ token.name }} #{{ token.tokenId }}</span>
        <span v-if="token.description">{{ shortString(token.description, 80, 60) }}</span>
      </h1>
      <p v-if="mintOpen" class="muted">Closes in {{ blocksRemaining }} {{ pluralize('block', Number(blocksRemaining))}}</p>
      <p v-else class="muted">Closed at block {{ token.untilBlock }}</p>
    </HeaderSection>
    <Image :src="token.artifact" :alt="token.name" />
    <footer>
      <MintToken v-if="mintOpen" :token="token" />
      <Button
        v-else
        :to="{
          name: 'id-collection-tokenId',
          params: { id: collection.owner, collection: token.collection, tokenId: token.tokenId }
        }"
      >View {{ token.name }}</Button>
    </footer>
    <p class="muted" v-if="ownedBalance">You own {{ ownedBalance }} "{{ token.name }}" {{ pluralize('token', Number(ownedBalance)) }}</p>
  </article>
</template>

<script setup lang="ts">
import { useAccount, useBlockNumber } from '@wagmi/vue'

const { token } = defineProps<{
  token: Token
}>()

const { address, isConnected } = useAccount()
const store = useOnchainStore()
const collection = computed(() => store.collection(token.collection))

const id = useArtistId()
const artistName = useAccountName(id.value as `0x${string}`)

const { data: currentBlock } = useBlockNumber({ chainId: 1337 })
const mintOpen = computed(() => currentBlock.value && token.untilBlock > currentBlock.value)
const blocksRemaining = computed(() => token.untilBlock - (currentBlock.value || 0n))
const secondsRemaining = computed(() => blocksToSeconds(blocksRemaining.value))
const until = computed(() => nowInSeconds() + secondsRemaining.value)

const ownedBalance = computed(() => store.tokenBalance(collection.value.address, token.tokenId))
// const maybeCheckBalance = async (force = false) => {
//   if (isConnected.value && (ownedBalance.value === null || force)) {
//     await store.fetchTokenBalance(token, address.value as `0x${string}`)
//   }
// }

</script>

<style lang="postcss" scoped>
  .token {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--spacer);
    padding: var(--spacer-xl) var(--spacer) !important;

    h1 {
      span:last-child:not(:first-child) {
        color: var(--muted-light);
        display: block;
      }
    }

    /* Tokens should be at min the screen height. */
    &:not(:first-of-type) {
      min-height: calc(100dvh - 2*var(--navbar-height));

      @media (--md) {
        min-height: calc(100dvh - var(--navbar-height));
      }
    }

    > p {
      color: var(--muted-light);
      font-size: var(--font-sm);
      text-align: left;
    }
  }

  footer {
    width: 100%;
    display: flex;
    gap: var(--spacer);
    justify-content: space-between;
    align-items: baseline;

    > *:first-child:last-child {
      margin-left: auto;
    }
  }
</style>
