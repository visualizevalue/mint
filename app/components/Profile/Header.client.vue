<template>
  <header>
    <img :src="artist.avatar || `/icons/opepen.svg`" :alt="name">
    <h1 @click="() => copy(address)">
      <span>{{ name }}</span>
      <small v-if="copied">copied...</small>
      <small v-else-if="artist.ens">{{ shortAddress(address) }}</small>
    </h1>
    <p v-if="artist?.description">{{ artist.description }}</p>
  </header>
</template>

<script setup>
import { useClipboard } from '@vueuse/core'

const props = defineProps({
  address: String,
})

const store = useOnchainStore()

const artist = computed(() => store.artist(props.address))
const name = computed(() => artist.value?.ens || shortAddress(props.address))
const artistAddress = computed(() => props.address)
const { copy, copied } = useClipboard({ source: artistAddress })
</script>

<style lang="postcss" scoped>
header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacer);

  img {
    width: var(--size-9);
    height: var(--size-9);
    border-radius: 50%;
    border: var(--border);
  }

  h1 {
    cursor: pointer;

    > * {
      display: block;
    }

    small {
      color: var(--muted);
    }
  }

  p {
    color: var(--muted);
  }
}
</style>
