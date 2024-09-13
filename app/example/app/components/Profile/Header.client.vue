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

    <ul v-if="hasTags">
      <Button v-if="validateURI(artist.url)" :to="validateURI(artist.url)" class="small">
        {{ getMainDomain(artist.url) }}
      </Button>
      <Button v-if="artist.email" :to="`mailto:${artist.email}`" class="small">
        {{ artist.email }}
      </Button>
      <Button v-if="artist.twitter" :to="`https://x.com/${artist.twitter}`" class="small">
        {{ artist.twitter }}
      </Button>
      <Button v-if="artist.github" :to="`https://github.com/${artist.github}`" class="small">
        {{ artist.github }}
      </Button>
    </ul>
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
    text-align: center;

    > * {
      display: block;
    }

    small {
      color: var(--muted);
      font-size: var(--font-xs);
    }
  }

  p {
    color: var(--muted);
    text-align: center;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacer-sm);
    justify-content: center;
  }
}
</style>
