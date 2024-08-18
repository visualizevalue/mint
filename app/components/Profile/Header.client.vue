<template>
  <header>
    <img v-if="artist?.avatar" :src="artist.avatar" :alt="artist.ens">
    <h1 v-if="artist?.ens">{{ artist.ens }} <small>{{ artist.address }}</small></h1>
    <p v-else>{{ address }}</p>
    <p v-if="artist?.description">{{ artist.description }}</p>
  </header>
</template>

<script setup>
const props = defineProps({
  address: String,
})

const store = useOnchainStore()

const artist = computed(() => store.artist(props.address))
</script>
