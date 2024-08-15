<template>
  <Loading v-if="! artist" />
  <PageFrame v-else title="Profile">
    <header>
      <ClientOnly>
        <img v-if="artist?.avatar" :src="artist.avatar" :alt="artist.ens">
        <h1 v-if="artist?.ens">{{ artist.ens }} <small>{{ artist.address }}</small></h1>
        <p v-else>{{ artist.address }}</p>
        <p v-if="artist?.description">{{ artist.description }}</p>
      </ClientOnly>
    </header>

    <section v-if="isMe">
      <Button>Edit Profile</Button>
    </section>

    <CollectionsOverview :id="address" />
  </PageFrame>
</template>

<script setup>
const config = useRuntimeConfig()
const route = useRoute()
const address = computed(() => route.params.address)
const store = useOnchainStore()
const isMe = useIsMeCheck(address.value)

const artist = ref(null)

const load = async () => {
  await store.fetchArtist(address.value, config.public.factoryAddress)

  artist.value = store.artist(address.value)
}
onMounted(() => load())
</script>

<style lang="postcss" scoped>
</style>
