<template>
  <header class="app-header">
    <ClientOnly>
      <Breadcrumbs :items="breadcrumbs" />

      <MintGasPricePopover />

      <Connect v-if="! isConnected" />
      <Button v-else
        :to="{
          name: 'profile-address',
          params: { address: address?.toLowerCase() }
        }"
        class="account link"
      >
        <Account :address="address" />
      </Button>
    </ClientOnly>
  </header>
</template>

<script setup>
import { useAccount } from '@wagmi/vue'

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

watchEffect(() => {
  if (! isConnected.value) {
    store.clearAllTokenBalances()
  }
})
</script>

<style scoped>
header {
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacer);
  padding: var(--size-3) var(--size-6);

  font-size: var(--app-header-font-size);
  font-family: var(--app-header-font-family);
  font-weight: var(--app-header-font-weight);
  text-transform: var(--app-header-text-transform);
  letter-spacing: var(--app-header-letter-spacing);

  :deep(> .breadcrumb) {
    text-overflow: ellipsis;
    justify-content: flex-start;
    white-space: nowrap;

    > *:first-child:last-child {
      a {
        color: var(--color);
      }
    }
  }

  :deep(> .gas) {
    display: none;
    margin-left: auto;
    white-space: nowrap;
    width: min-content;

    @media (--md) {
      display: block;
    }
  }

  :deep(> .button),
  :deep(> button),
  :deep(> a) {
    font-size: inherit;
    font-family: inherit;
    font-weight: inherit;
    text-transform: inherit;
    letter-spacing: inherit;
  }
}
</style>

