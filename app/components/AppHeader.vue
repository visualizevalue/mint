<template>
  <header :style="{ borderColor: y > 10 ? 'var(--border-color)' : 'transparent' }">
    <Breadcrumbs :items="breadcrumbs" />

    <ClientOnly>
      <GasPrice #default="{ price }">
        <span class="gas">{{ price.formatted.gwei }} GWEI</span>
      </GasPrice>

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

const title = useAppTitle()
const subdomain = useSubdomain()
const appBreadcumbs = useAppBreadcrumb()
const { isConnected, address } = useAccount()
const id = useArtistId()
const breadcrumbs = computed(() => {
  // FIXME: Fix this...
  const all = [
    {
      to: id.value
        ? { name: 'id', params: { id: id.value } }
        : `/`,
      text: title.value
    },
    ...appBreadcumbs.value.filter(i => id.value ? i.to?.name !== 'id' : true),
  ]

  return all
})

const { y } = useWindowScroll()
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
  gap: var(--spacer-lg);
  padding: var(--spacer);

  :deep(> .breadcrumb) {
    > *:first-child {
      a {
        color: var(--color);
      }
    }
  }

  .gas {
    margin-left: auto;
    white-space: nowrap;
  }
}

/* COLORS */
header {
  background: var(--black-semi);
  backdrop-filter: blur(var(--size-1));
  border-bottom: var(--border);
  border-color: transparent;
}
</style>
