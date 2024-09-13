<template>
  <header v-if="artist">
    <slot name="before" />

    <img :src="artist.avatar || `/icons/opepen.svg`" :alt="name">
    <h1 @click="() => copy(address)">
      <span>{{ name }}</span>
      <small v-if="copied">copied...</small>
      <small v-else-if="artist.ens">{{ shortAddress(address) }}</small>
    </h1>
    <p v-if="artist?.description">{{ artist.description }}</p>

    <Actions v-if="hasTags">
      <ButtonProfileWebsite :profile="artist" />
      <ButtonProfileEmail :profile="artist" />
      <ButtonProfileTwitter :profile="artist" />
      <ButtonProfileGithub :profile="artist" />
    </Actions>
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

const hasTags = computed(() => artist.value.url ||
  artist.value.email ||
  artist.value.twitter ||
  artist.value.github
)
</script>

<style scoped>
header {
  display: flex;
  flex-direction: column;
  gap: var(--spacer);

  img {
    width: var(--size-9);
    height: var(--size-9);
  }

  h1 {
    cursor: pointer;

    > * {
      display: block;
    }

    small {
      color: var(--muted);
      font-size: var(--font-xs);
    }
  }
}
</style>
