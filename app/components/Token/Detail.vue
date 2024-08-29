<template>
  <article class="token">
    <div class="artifact">
      <Image :src="token.artifact" :alt="token.name" class="borderless" />
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
        blocksRemaining,
        transactionFlowConfig
      }"
    >
      <section class="details">
        <header class="title">
          <h1>{{ token.name }} <span class="muted-light">#{{ token.tokenId }}</span></h1>
          <p v-if="token.description" class="muted-light">
            <ExpandableText :text="token.description" :length="95" expand-text="Read More" />
          </p>
        </header>

        <div>
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
        </div>

        <div class="mint-status">
          <p v-if="mintOpen">{{ blocksRemaining }} blocks remaining</p>
          <p class="muted-light" v-if="ownedBalance">You own {{ ownedBalance }} {{ pluralize('token', Number(ownedBalance)) }}</p>
        </div>
      </section>
    </MintToken>
  </article>
</template>

<script setup lang="ts">
import ExpandableText from '../ExpandableText.vue';

const { token } = defineProps<{
  token: Token
}>()

const store = useOnchainStore()
const collection = computed(() => store.collection(token.collection))

const mintCount = ref('1')
const ownedBalance = computed(() => store.tokenBalance(collection.value.address, token.tokenId))
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

  .mint-status {
    display: flex;
    gap: var(--spacer);
    flex-wrap: wrap;

    @media (--md) {
      justify-content: space-between;
    }
  }

</style>
