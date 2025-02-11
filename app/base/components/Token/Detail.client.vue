<template>
  <article class="token-detail">
    <div class="artifact">
      <Embed v-if="token.animationUrl" :src="token.animationUrl" :muted="false" controls />
      <Image v-else-if="token.image" :src="token.image" :alt="token.name" />
      <ImageVoid v-else />

      <Actions>
        <Button :to="{ name: 'id-collection-tokenId-full' }" title="Open">
          <Icon type="maximize" />
        </Button>
      </Actions>
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
        countDownStr,
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
          <p v-if="mintOpen">
            <TokenMintOpen :blocks="blocksRemaining" :time="countDownStr" />
          </p>
          <p v-else-if="currentBlock">
            {{ $t('token.closed_ago', { time: countDownStr })}}
          </p>
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
    --artifact-width: 100cqw;
    --artifact-height: 100%;

    @media (--md) {
      --artifact-width: 50cqw;
      --padding-top: var(--spacer-lg);
      --padding-x: var(--spacer-lg);
      --padding-bottom: calc(var(--spacer-lg) + var(--spacer));
    }

    @media (--lg) {
      --artifact-width: 60cqw;
      --padding-top: var(--spacer-xl);
      --padding-x: var(--spacer-xl);
      --padding-bottom: calc(var(--spacer-xl) + var(--spacer));
    }

    width: var(--artifact-width);
    height: var(--artifact-height);
    padding: var(--padding-top) var(--padding-x) var(--padding-bottom);
    position: relative;
    container-type: inline-size;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: var(--border);

    @media (--md) {
      border-bottom: none;
      border-right: var(--border);
      display: flex;
      justify-content: center;
      align-items: center;
      container-type: size;
    }

    > menu {
      position: absolute;
      bottom: var(--spacer);
      right: var(--spacer);
      width: fit-content;
      padding: 0;
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
