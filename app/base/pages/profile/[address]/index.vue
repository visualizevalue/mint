<template>
  <Loading v-if="! artist" />
  <PageFrame v-else title="Profile">

    <ProfileHeader :address="address">
      <template v-if="isMe" #before>
        <Actions>
          <ButtonEditProfile :address="address" />
        </Actions>
      </template>
    </ProfileHeader>

    <CollectedItems v-if="hasIndexer" :id="address" :key="`collected-${address}`">
      <template #before>
        <HeaderSection>
          <h1>{{ $t('collected.title') }}</h1>
        </HeaderSection>
      </template>
    </CollectedItems>
  </PageFrame>
</template>

<script setup>
const config = useRuntimeConfig()
const route = useRoute()
const address = computed(() => route.params.address)
const store = useOnchainStore()
const isMe = useIsMeCheck(address.value)
const hasIndexer = useHasIndexer()

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
