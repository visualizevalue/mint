<template>
  <article class="token">
    <div class="artifact">
      <Image :src="token.artifact" :alt="token.name" class="borderless" />
    </div>

    <section class="details">
      <header class="title">
        <h1>{{ token.name }} <span class="muted-light">#{{ token.tokenId }}</span></h1>
        <p v-if="token.description" class="muted-light">
          <ExpandableText :text="token.description" :length="80" expand-text="Read More" />
        </p>
      </header>

    </section>
    <!-- <HeaderSection>
      <h1>
        <span>{{ token.name }} #{{ token.tokenId }}</span>
        <span v-if="token.description">{{ shortString(token.description, 80, 60) }}</span>
      </h1>
      <p v-if="mintOpen" class="muted">Closes in {{ blocksRemaining }} {{ pluralize('block', Number(blocksRemaining))}}</p>
      <p v-else class="muted">Closed at block {{ token.untilBlock }}</p>
    </HeaderSection> -->
    <!-- <footer>
      <MintToken v-if="mintOpen" :token="token" />
      <Button
        v-else
        :to="{
          name: 'id-collection-tokenId',
          params: { id: collection.owner, collection: token.collection, tokenId: token.tokenId }
        }"
      >View {{ token.name }}</Button>
    </footer>
    <p class="muted" v-if="ownedBalance">You own {{ ownedBalance }} "{{ token.name }}" {{ pluralize('token', Number(ownedBalance)) }}</p> -->
  </article>
</template>

<script setup lang="ts">
import { useAccount, useBlockNumber } from '@wagmi/vue'
import ExpandableText from '../ExpandableText.vue';

const { token } = defineProps<{
  token: Token
}>()

const config = useRuntimeConfig()
const { address, isConnected } = useAccount()
const store = useOnchainStore()
const collection = computed(() => store.collection(token.collection))

const id = useArtistId()
const artistName = useAccountName(id.value as `0x${string}`)

const { data: currentBlock } = useBlockNumber({ chainId: config.public.chainId })
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
    display: grid;
    grid-auto-rows: min-content;
    padding: 0 !important;
    min-height: calc(100dvh - 2*var(--navbar-height));

    @media (--md) {
      min-height: calc(100dvh - var(--navbar-height));
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-auto-rows: auto;
    }
  }

  .artifact {
    > * {
      width: 100%;

      &.image {
        border-bottom: var(--border) !important;
      }
    }

    @media (--md) {
      border-right: var(--border);
      height: 100%;
    }
  }

  .details {
    > * {
      border-bottom: var(--border);
      padding: var(--spacer);
    }

    header {
      display: grid;
      gap: var(--spacer-sm);

      h1 {
        font-size: var(--font-lg);
      }
    }
  }

</style>
