<template>
  <Loading v-if="! artist" />
  <PageFrame v-else title="Profile">

    <ProfileHeader :address="address">
      <template v-if="isMe" #before>
        <Actions>
          <Button :to="`https://app.ens.domains/${address}`" class="small">
            <Icon type="edit-2" />
            <span>Edit Profile</span>
          </Button>
        </Actions>
      </template>
    </ProfileHeader>

    <section v-if="artistScope" class="centered muted">
      <p>Collected art from <Account :address="artistScope" /> will be indexed on profiles soon...</p>
      <p v-if="isMyArtistScope">Manage Your collections <NuxtLink :to="{ name: 'id', params: { id: address } }">here</NuxtLink>.</p>
      <p v-else>You can mint your own art on <NuxtLink :to="config.public.platformUrl" target="_blank">{{ getMainDomain(config.public.platformUrl) }}</NuxtLink>.</p>
    </section>
    <section v-else class="centered">
      <p class="muted">Collected art and curation options for your profile will come soon...</p>
    </section>
  </PageFrame>
</template>

<script setup>
const config = useRuntimeConfig()
const route = useRoute()
const address = computed(() => route.params.address)
const store = useOnchainStore()
const isMe = useIsMeCheck(address.value)
const artistScope = useArtistScope()
const isMyArtistScope = useIsMeCheck(artistScope)

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

<style scoped>
</style>
