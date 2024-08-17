<template>
  <Loading v-if="! artist" />
  <PageFrame v-else title="Profile">
    <section v-if="isMe">
      <Button :to="`https://app.ens.domains/${address}`">Edit Profile</Button>
    </section>

    <ProfileHeader :address="address" />

    <CollectionsOverview v-if="showCollections" :id="address">
      <template #before>
        <h1>Collections</h1>
      </template>
    </CollectionsOverview>
  </PageFrame>
</template>

<script setup>
const config = useRuntimeConfig()
const route = useRoute()
const address = computed(() => route.params.address)
const store = useOnchainStore()
const isMe = useIsMeCheck(address.value)
const subdomain = useSubdomain()

const showCollections = computed(() => !subdomain.value || subdomain.value === address.value)

const artist = ref(null)

const load = async () => {
  await store.fetchArtistScope(address.value, config.public.factoryAddress)

  artist.value = store.artist(address.value)
}
onMounted(() => load())
</script>

<style lang="postcss" scoped>
</style>
