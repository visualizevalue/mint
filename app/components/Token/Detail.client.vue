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
    position: relative;
    container-type: inline-size;

    display: grid;
    grid-auto-rows: min-content;
    padding: 0 !important;

    @media (--md) {
      height: calc(100dvh - var(--navbar-height));
      grid-template-columns: 60% 1fr;
      grid-auto-rows: auto;
    }
  }

  .artifact {
    --padding-x: 0;
    --padding-top: 0;
    --padding-bottom: 0;
    --width: 100cqw;
    /* --height: calc(100cqh - var(--padding-top) - var(--padding-bottom)); */
    --height: 100%;
    --dimension: min(100cqw, 100cqh);

    @media (--md) {
      --width: 60cqw;
      --height: calc(100cqh - var(--navbar-height));
      --padding-top: var(--spacer-lg);
      --padding-x: var(--spacer-lg);
      --padding-bottom: calc(var(--spacer-lg) + var(--spacer));
      --padding-bottom: var(--spacer-lg);

      --dimension: min(
        calc(60cqw - var(--padding-x)*2),
        calc(100cqh - var(--padding-top) - var(--padding-bottom))
      );
    }

    @media (--lg) {
      --padding-top: var(--spacer-xl);
      --padding-x: var(--spacer-xl);
      --padding-bottom: calc(var(--spacer-xl) + var(--spacer-lg));
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

      &.shaded {
        box-shadow: var(--shadow-xl);
        transform: translateY(calc(-1 * var(--size-2))) scale(1.001);
      }
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
