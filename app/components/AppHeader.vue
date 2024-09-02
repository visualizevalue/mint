<template>
  <header :style="{ borderColor: y > 10 ? 'var(--border-color)' : 'transparent' }">
    <ClientOnly>
      <Breadcrumbs :items="breadcrumbs" />

      <span class="gas">
        {{ displayPrice.value }} {{ displayPrice.format }}
        (${{ dollarPrice }})
      </span>

      <Connect v-if="! isConnected" />
      <NuxtLink v-else :to="{ name: 'profile-address', params: { address: address?.toLowerCase() } }">
        <Account :address="address" />
      </NuxtLink>
    </ClientOnly>
  </header>
</template>

<script setup>
import { useAccount } from '@wagmi/vue'
import { useWindowScroll } from '@vueuse/core'

const { isConnected, address } = useAccount()
const appBreadcumbs = useAppBreadcrumb()
const title = useAppTitle()
const id = useArtistId()
const breadcrumbs = computed(() => {
  const all = [
    {
      to: id.value === address.value?.toLowerCase()
        ? { name: 'id', params: { id: id.value } }
        : `/`,
      text: title.value
    },
    ...appBreadcumbs.value,
  ]

  return all
})

const { y } = useWindowScroll()

const mintCount = ref(1)
const { price, displayPrice } = await useMintPrice(mintCount)
const priceFeed = usePriceFeedStore()
const dollarPrice = computed(() => priceFeed.weiToUSD(price.value))
</script>

<style lang="postcss" scoped>
header {
  height: var(--navbar-height);
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacer);
  padding: var(--size-3) var(--size-6);

  @media (--md) {
    gap: var(--spacer-lg);
  }

  :deep(> .breadcrumb) {
    /* max-width: 60vw; */
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: flex-start;
    white-space: nowrap;

    > *:first-child:last-child {
      a {
        color: var(--color);
      }
    }
  }

  .gas {
    display: none;
    margin-left: auto;
    white-space: nowrap;

    @media (--md) {
      display: block;
    }
  }

  :deep(> .button:last-child) {
    margin-right: calc(-1 * var(--size-3));
  }

  &:has(+ main > .frame.full) {
    border-color: var(--border-color) !important;
  }
}

/* COLORS */
header {
  background: var(--background-semi);
  backdrop-filter: blur(var(--size-1));
  border-bottom: var(--border);
  border-color: transparent;
}
</style>
