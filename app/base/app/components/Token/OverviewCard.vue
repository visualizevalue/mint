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
      transactionFlowConfig
    }"
  >
    <article class="token-overview-card">
      <div class="content">
        <header>
          <h1>
            <span>{{ token.name }} <span class="muted">#{{ token.tokenId }}</span></span>
            <span v-if="token.description">{{ shortString(token.description, 60, 30) }}</span>
          </h1>
          <p v-if="mintOpen" class="muted">Closes in {{ blocksRemaining }} {{ pluralize('block', Number(blocksRemaining))}}</p>
          <p v-else class="muted">Closed at block {{ token.untilBlock }}</p>
        </header>
        <Image :src="token.artifact" :alt="token.name" class="bordered" />
        <CardLink :to="{
          name: 'id-collection-tokenId',
          params: { id: collection.owner, collection: token.collection, tokenId: `${token.tokenId}` }
        }">View {{ token.name }}</CardLink>
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
        <p class="muted" v-if="ownedBalance">You own {{ ownedBalance }} "{{ token.name }}" {{ pluralize('token', Number(ownedBalance)) }}</p>
      </footer>
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
    padding: var(--spacer-xl) var(--spacer) !important;

    /* Tokens should be at min the screen height. */
    &:not(:first-of-type) {
      min-height: min(60rem, calc(100dvh - 2*var(--navbar-height)));

      @media (--md) {
        min-height: min(60rem, calc(100dvh - var(--navbar-height)));
      }
    }

    > p {
      color: var(--muted-light);
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
        color: var(--muted-light);
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
