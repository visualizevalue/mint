<template>
  <article class="token-detail">
    <div class="artifact">
      <div>
        <Image v-if="token.artifact" :src="token.artifact" :alt="token.name" />
        <ImageVoid v-else />
      </div>
    </div>

    <MintToken
      :token="token"
      :mint-count="mintCount"
      #default="{
        displayPrice,
        dollarPrice,
        mintRequest,
        minted,
        mintOpen,
        currentBlock,
        blocksRemaining,
        transactionFlowConfig
      }"
    >
      <section class="details">
        <header class="title">
          <h1>{{ token.name }} <small>#{{ token.tokenId }}</small></h1>
          <p v-if="token.description">
            <ExpandableText :text="token.description" :length="95" :expand-text="$t('read_more')" :collapse-text="$t('collapse')" />
          </p>
          <p v-if="collection" class="artist">
            {{ $t('token.by') }} <NuxtLink :to="{ name: 'id', params: { id: collection.owner } }">{{ store.displayName(collection.owner) }}</NuxtLink>
          </p>
        </header>

        <div v-if="mintOpen">
          <MintTokenBar
            v-model:mintCount="mintCount"
            v-bind="{
              token,
              displayPrice,
              dollarPrice,
              mintRequest,
              transactionFlowConfig,
              minted,
            }"
          />
        </div>

        <div class="mint-status">
          <p v-if="mintOpen">{{ $t('token.blocks_remaining', { blocksRemaining }) }}</p>
          <p v-else-if="currentBlock">{{ $t('token.closed_at_block', { untilBlock: token.untilBlock }) }}</p>
          <p v-if="ownedBalance">
            {{ $t('token.you_own', { ownedBalance }) }} 
            {{ $t('tokens', Number(ownedBalance)) }}
          </p>
        </div>

        <TokenMintTimeline :token="token" :collection="collection" class="network-mints" />
      </section>
    </MintToken>
  </article>
</template>

<script setup lang="ts">
import ExpandableText from '../ExpandableText.vue'

const { token } = defineProps<{
  token: Token
}>()

const store = useOnchainStore()
const collection = computed(() => store.collection(token.collection))

const mintCount = ref('1')
const ownedBalance = computed(() => collection.value && store.tokenBalance(collection.value.address, token.tokenId))
</script>

<style scoped>
  .token-detail {
    position: relative;
    container-type: inline-size;

    display: grid;
    grid-auto-rows: min-content;
    padding: 0 !important;
    border-top: var(--border);

    @media (--md) {
      height: calc(100dvh - var(--navbar-height));
      grid-template-columns: 50% 1fr;
      grid-auto-rows: auto;
    }

    @media (--lg) {
      grid-template-columns: 60% 1fr;
    }
  }

  .artifact {
    --padding-x: 0;
    --padding-top: 0;
    --padding-bottom: 0;
    --width: 100cqw;
    --height: 100%;
    --dimension: min(100cqw, 100cqh);

    @media (--md) {
      --width: 50cqw;
      --height: calc(100cqh - var(--navbar-height));
      --padding-top: var(--spacer-lg);
      --padding-x: var(--spacer-lg);
      --padding-bottom: calc(var(--spacer-lg) + var(--spacer));
      --padding-bottom: var(--spacer-lg);

      --dimension: min(
        calc(var(--width) - var(--padding-x)*2),
        calc(100cqh - var(--padding-top) - var(--padding-bottom))
      );
    }

    @media (--lg) {
      --width: 60cqw;
      --padding-top: var(--spacer-xl);
      --padding-x: var(--spacer-xl);
      --padding-bottom: calc(var(--spacer-xl) + var(--spacer));
    }

    height: var(--height);
    width: var(--width);
    padding: var(--padding-top) var(--padding-x) var(--padding-bottom);

    @media (--md) {
      border-right: var(--border);
      display: flex;
      justify-content: center;
      align-items: center;
    }

    > * {
      width: var(--dimension);
      height: auto;
      border-bottom: var(--border) !important;
      transition: transform var(--speed-slow), box-shadow var(--speed-slow);

      @media (--md) {
        border-bottom: none !important;
      }
    }
  }

  .details {

    @media (--md) {
      overflow-y: auto;
      -webkit-overflow-scrolling: auto;
    }

    > * {
      border-bottom: var(--border);
      padding: var(--spacer);

      @media (--md) {
        padding: var(--spacer) var(--spacer-lg);
      }
    }

    header {
      z-index: 100;
      display: grid;
      gap: var(--spacer-sm);
      background: var(--card-background);
      backdrop-filter: var(--blur);

      h1 {
        font-size: var(--font-lg);

        small {
          color: var(--muted);
        }
      }

      @media (--md) {
        padding: var(--spacer-lg);
        position: sticky;
        top: 0;
      }
    }
  }

  .mint-status {
    display: flex;
    gap: var(--spacer);
    flex-wrap: wrap;

    @media (--md) {
      justify-content: space-between;
    }
  }
</style>
