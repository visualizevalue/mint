<template>
  <slot :collection="collection">
    <CollectionIntro :collection="collection" />

    <TokenOverviewCard v-for="token of tokens" :key="token.tokenId" :token="token" />

    <Loading v-if="loading" />
    <div v-if="! tokens.length && !loading" >
      <p>No tokens yet</p>
    </div>
  </slot>
</template>

<script setup>
const props = defineProps(['collection'])
const collection = computed(() => props.collection)

const store = useOnchainStore()

const tokens = computed(() => store.tokens(collection.value.address))
const loading = ref(false)
onMounted(async () => {
  loading.value = true
  await store.fetchCollectionTokens(collection.value.address)
  loading.value = false
})
</script>

