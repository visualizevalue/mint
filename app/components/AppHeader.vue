<template>
  <header :style="{ borderColor: y > 10 ? 'var(--border-color)' : 'transparent' }">
    <h1>
      <NuxtLink to="/">
        {{ config.public.title }}
      </NuxtLink>
    </h1>

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

const config = useRuntimeConfig()
const { isConnected, address } = useAccount()

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
