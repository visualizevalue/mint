<template>
  <PageFrame :title="breadcrumb" class="full">
    <TokenDetail :token=token />
  </PageFrame>
</template>

<script setup>
import { useAccount } from '@wagmi/vue'

const id = useArtistId()
const route = useRoute()
const { address, isConnected } = useAccount()
const props = defineProps(['collection', 'token'])
const collection = computed(() => props.collection)
const token = computed(() => props.token)
const tokenId = computed(() => BigInt(route.params.tokenId))
const store = useOnchainStore()

// Keep track of account token balance
const ownedBalance = computed(() => store.tokenBalance(collection.value.address, token.value.tokenId))
const maybeCheckBalance = async (force = false) => {
  if (isConnected.value && (ownedBalance.value === null || force)) {
    await store.fetchTokenBalance(token.value, address.value)
  }
}
watch(isConnected, () => maybeCheckBalance(true))

// Navigation guards
onMounted(async () => {
  if (collection.value.latestTokenId < tokenId.value) {
    return navigateTo({ name: 'id-collection', params: { id: id.value, collection: collection.value.address }}, {
      replace: true
    })
  }

  await maybeCheckBalance()
})

const hideArtist = useHideArtistInHeader()
const breadcrumb = computed(() => {
  const path = hideArtist.value ? [] : [
    {
      text: store.displayName(id.value),
      to: { name: 'id', params: { id: id.value } }
    }
  ]

  return [
    ...path,
    {
      text: `${ collection.value.name || 'Unnamed Collection' }`,
      to: { name: 'id-collection', params: { id: id.value, collection: collection.value.address } }
    },
    {
      text: `#${ tokenId.value }`
    },
  ]
})

useMetaData({
  title: `${ token.value?.name } (#${tokenId.value}) | ${collection.value.name}`,
})
</script>

<style scoped>
</style>
