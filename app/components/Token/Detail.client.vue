<template>
  <article class="token">
    <div class="artifact">
      <div :class="{ shaded }">
        <Image :src="token.artifact" :alt="token.name" class="borderless" />
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
import ExpandableText from '../ExpandableText.vue'

const { token } = defineProps<{
  token: Token
}>()

const breakpoints = useBreakpoints()
const shaded = computed(() => breakpoints.greater('sm').value && ! isDark.value)

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
      grid-template-columns: 60% 1fr;
      grid-auto-rows: auto;
    }
  }

  .artifact {
    > * {
      width: 100%;
      border-bottom: var(--border) !important;
      transition: all var(--speed-slow);

      > .image {
        width: 100%;
      }

      @media (--md) {
        border-bottom: none !important;
      }

      &.shaded {
        box-shadow: var(--shadow-xl);
        transform: translateY(calc(-1 * var(--size-2))) scale(1.001);
      }
    }

    @media (--md) {
      border-right: var(--border);
      height: 100%;
      padding: var(--spacer-lg);
    }

    @media (--lg) {
      padding: var(--spacer-xl);
    }
  }

  .details {
    > * {
      border-bottom: var(--border);
      padding: var(--spacer);

      @media (--md) {
        padding: var(--spacer) var(--spacer-lg);
      }
    }

    header {
      display: grid;
      gap: var(--spacer-sm);

      h1 {
        font-size: var(--font-lg);
      }

      @media (--md) {
        padding: var(--spacer-lg);
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
