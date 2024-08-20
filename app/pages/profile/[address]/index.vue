<template>
  <Loading v-if="! artist" />
  <PageFrame v-else title="Profile">

    <ProfileHeader :address="address">
      <template  v-if="isMe" #before>
        <Actions>
          <Button :to="`https://app.ens.domains/${address}`" class="small">
            <Icon type="edit-2" />
            <span>Edit Profile</span>
          </Button>
        </Actions>
      </template>
    </ProfileHeader>

    <section class="centered">
      <p class="muted">Indexing collected art will come soon...</p>
    </section>
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
  await store.fetchArtistScope(address.value, config.public.factoryAddress)

  artist.value = store.artist(address.value)
}
onMounted(() => load())

useMetaData({
  title: artist.value?.ens || shortAddress(address.value),
})
</script>

<style lang="postcss" scoped>
</style>
