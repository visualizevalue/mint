<template>
  <div class="token-mint-timeline-item">
    <slot :mint="mint" :formatted-price="formattedPrice">
      <NuxtLink :to="{ name: 'profile-address', params: { address: mint.address } }" class="account">
        <Account :address="mint.address" />
      </NuxtLink>

      <span class="amount">{{ mint.amount.toString() }}<span>×</span></span>

      <span class="price">{{ formattedPrice.value }} {{ formattedPrice.format }}</span>

      <span class="time-ago"><BlocksTimeAgo :blocks="block - mint.block" /></span>

      <span class="links">
        <NuxtLink :to="`${config.public.blockExplorer}/tx/${mint.tx}`" target="_blank">
          <Icon type="link" />
        </NuxtLink>
      </span>
    </slot>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()

const props = defineProps({
  mint: Object,
  block: BigInt,
})

const formattedPrice = computed(() => props.mint && customFormatEther(props.mint.price))
</script>

<style>
  .token-mint-timeline-item {
    display: grid;
    gap: 0 var(--spacer-sm);
    grid-template-columns: 1fr 1fr;

    .account {
      grid-column: span 2;
    }

    .price,
    .links {
      text-align: right;
    }

    span {
      white-space: nowrap;

      &:not(.account):not(.account *) {
        color: var(--muted);
        font-size: var(--font-sm);
      }
    }

    a,
    button {
      color: var(--color);

      &:--highlight {
        color: var(--color);
      }
    }

    @container (min-width: 24rem) {
      grid-template-columns: max(6rem, 40%) 3rem 1fr 1fr 2rem;
      gap: var(--spacer);

      .account {
        grid-column: 1;
      }

      .time-ago,
      .amount {
        text-align: right;
      }

      span:not(.account) {
        font-size: var(--font-base);
      }
    }
  }
</style>
