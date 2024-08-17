<template>
  <nav v-if="isConnected">
    <NuxtLink :to="{ name: 'id', params: { id: account } }">
      <Icon type="home" />
      <span>Home</span>
    </NuxtLink>
    <NuxtLink :to="{ name: 'profile-address', params: { address: account } }">
      <Icon type="user" />
      <span>Profile</span>
    </NuxtLink>
  </nav>
</template>

<script setup>
import { useAccount } from '@wagmi/vue'

const { address, isConnected } = useAccount()

const account = computed(() => address.value.toLowerCase())
</script>

<style lang="postcss" scoped>
nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacer-lg);

  > * {
    padding: var(--size-4);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacer-sm);
    height: var(--size-6);
    color: var(--gray-z-5);

    :deep(> .icon) {
      width: var(--size-6);
      height: var(--size-6);
    }

    > span {
      display: none;
    }

    &.router-link-active {
      color: var(--color);
    }
  }
}

/* POSITIONAL */
nav {
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  height: var(--navbar-height);
  z-index: 100;

  @media (--md) {
    top: 0;
    right: auto;
    flex-direction: column;
    height: 100dvh;
    width: var(--navbar-width);

    /* FOR NOW */
    display: none;
  }
}

/* COLORS */
nav {
  background: var(--black-semi);
  backdrop-filter: blur(var(--size-1));
  border-top: var(--border);

  @media (--md) {
    background: none;
    backdrop-filter: none;
    border-top: none;
  }
}
</style>
