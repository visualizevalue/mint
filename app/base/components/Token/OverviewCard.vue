<template>
  <MintToken
    :token="token"
    :mintCount="mintCount"
    #default="{
      displayPrice,
      dollarPrice,
      mintRequest,
      minted,
      mintOpen,
      blocksRemaining,
      secondsRemaining,
      countDownStr,
      transactionFlowConfig
    }"
  >
    <article class="token-overview-card">
      <slot
        :token="token"
        :displayPrice="displayPrice"
        :dollarPrice="dollarPrice"
        :mintRequest="mintRequest"
        :minted="minted"
        :mintOpen="mintOpen"
        :secondsRemaining="secondsRemaining"
        :countDownStr="countDownStr"
        :blocksRemaining="blocksRemaining"
        :transactionFlowConfig="transactionFlowConfig"
      >
        <div class="content">
          <header>
            <h1>
              <span>{{ token.name }} <span class="token-id">#{{ token.tokenId }}</span></span>
              <span v-if="token.description" class="description">{{ shortString(token.description, 60, 30) }}</span>
            </h1>
            <p v-if="mintOpen" class="closes-in">{{ $t('token.closes_in', { time: countDownStr }) }}</p>
          </header>
          <Embed v-if="token.animationUrl" :src="token.animationUrl" />
          <Image v-else-if="token.image" :src="token.image" :alt="token.name" />
          <ImageVoid v-else />
          <CardLink :to="{
            name: 'id-collection-tokenId',
            params: { id: collection.owner, collection: token.collection, tokenId: `${token.tokenId}` }
          }">{{ $t('token.view')}} {{ token.name }}</CardLink>
        </div>
        <footer>
          <MintTokenBar
            v-if="mintOpen"
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
          <p class="muted" v-if="ownedBalance">
            {{ $t('token.you_own', { ownedBalance: ownedBalance, token: token.name }) }} {{ $t('tokens', Number(ownedBalance)) }}
          </p>
        </footer>
      </slot>
    </article>
  </MintToken>
</template>

<script setup lang="ts">
const { token } = defineProps<{
  token: Token
}>()

const store = useOnchainStore()
const collection = computed(() => store.collection(token.collection)) as ComputedRef<Collection>

const mintCount = ref('1')
const ownedBalance = computed(() => store.tokenBalance(collection.value.address, token.tokenId))
</script>

<style scoped>
  .token-overview-card,
  .token-overview-card > .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--spacer);
  }

  .token-overview-card {
    padding: var(--spacer-xl) var(--spacer);
    min-height: min(60rem, 100dvh);

    > p {
      color: var(--);
      font-size: var(--font-sm);
      text-align: left;
    }
  }

  .token-overview-card > .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--spacer);

    header {
      display: flex;
      flex-direction: column;
      gap: var(--spacer-xs);

      @media (--sm) {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: var(--spacer);
      }
    }

    h1 {
      span:last-of-type:not(:first-child) {
        color: var(--muted);
        font-size: var(--font-sm);
        white-space: wrap;
        display: none;

        @media (--md) {
          display: block;
        }
      }

      + p {
        @media (--md) {
          text-align: right;
        }
      }
    }
  }

  footer {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--spacer);
    justify-content: space-between;

    > * {
      width: 100%;
    }

    > *:first-child:last-child {
      margin-left: auto;
    }
  }
</style>
