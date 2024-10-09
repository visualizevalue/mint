<template>
  <header v-if="artist" class="profile-header">
    <slot name="before" />

    <img :src="artist.avatar || avatar" :alt="name" />
    <h1 @click="() => ! hideAddress && copy(address)">
      <span>{{ name }}</span>
      <small v-if="copied">{{ $t('profile.address_copied') }}</small>
      <small v-else-if="! hideAddress">{{ shortAddress(address) }}</small>
    </h1>
    <p v-if="description">{{ description }}</p>

    <slot name="tags">
      <Actions v-if="hasTags">
        <ButtonProfileWebsite :profile="artist" />
        <ButtonProfileEmail :profile="artist" />
        <ButtonProfileTwitter :profile="artist" />
        <ButtonProfileGithub :profile="artist" />
      </Actions>
    </slot>
  </header>
</template>

<script setup>
import { useClipboard } from '@vueuse/core'

const config = useRuntimeConfig()

const props = defineProps({
  address: String,
  avatar: String,
  name: String,
  description: String,
  hideAddress: Boolean,
})

const store = useOnchainStore()

const avatar = computed(() => props.avatar || config.public.defaultAvatar)
const artist = computed(() => store.artist(props.address))
const name = computed(() => props.name || artist.value?.ens || shortAddress(props.address))
const artistAddress = computed(() => props.address)
const { copy, copied } = useClipboard({ source: artistAddress })
const description = computed(() => props.description || artist.value.description)

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
    > * {
      display: block;
    }

    small {
      color: var(--muted);
      font-size: var(--font-sm);
      font-family: var(--ui-font-family);
      letter-spacing: var(--ui-letter-spacing);
      text-transform: var(--ui-text-transform);
      cursor: pointer;
    }
  }
}
</style>
