<template>
  <header class="app-header">
    <ClientOnly>
      <Breadcrumbs :items="breadcrumbs" />

      <MintGasPricePopover />

      <Connect v-if="! isConnected" />
      <NuxtLink v-else
        :to="{
          name: 'profile-address',
          params: { address: address?.toLowerCase() }
        }"
        class="account"
      >
        <Account :address="address" />
      </NuxtLink>
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
</script>

<style scoped>
header {
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacer);
  padding: var(--size-3) var(--size-6);

  @media (--md) {
    gap: var(--spacer-lg);
  }

  :deep(> .breadcrumb) {
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

  :deep(> .gas) {
    display: none;
    margin-left: auto;
    white-space: nowrap;
    width: min-content;

    @media (--md) {
      display: block;
    }
  }

  .account {
    font-family: var(--ui-font-family);
    font-size: var(--ui-font-size);
    letter-spacing: var(--ui-letter-spacing);
    text-transform: var(--ui-text-transform);
  }
}
</style>

