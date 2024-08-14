<template>
  <Authenticated>
    <PageFrame :title="[
      {
        text: `Collections`,
        to: `/${$route.params.id}/collections`
      },
      {
        text: `Manage ${ collection?.name || `Collection` }`
      }
    ]">
      <Loading v-if="loading" />
      <section v-else-if="collection">
        <img v-if="collection.image" :src="collection.image" :alt="collection.name">
        <h1>{{ collection.name }} <small>{{ collection.symbol }}</small></h1>
        <p>{{ collection.description }}</p>
        <p>Init Block: {{ collection.initBlock }}</p>
        <p>Latest Token: {{ collection.latestTokenId }}</p>
        <p>Owner: {{ collection.owner }}</p>
      </section>
    </PageFrame>
  </Authenticated>
</template>

<script setup>
const route = useRoute()
const address = route.params.address.toLowerCase()

const { $wagmi } = useNuxtApp()
const store = useCollectionsStore()
const loading = ref(false)
const collection = ref(null)

const load = async () => {
  loading.value = true

  if (! store.hasCollection(address)) {
    const [data, initBlock, latestTokenId, owner] = await Promise.all([
      readContract($wagmi, {
        abi: MINT_ABI,
        address,
        functionName: 'contractURI',
      }),
      readContract($wagmi, {
        abi: MINT_ABI,
        address,
        functionName: 'initBlock',
      }),
      readContract($wagmi, {
        abi: MINT_ABI,
        address,
        functionName: 'latestTokenId',
      }),
      readContract($wagmi, {
        abi: MINT_ABI,
        address,
        functionName: 'owner',
      }),
    ])

    const json = Buffer.from(data.substring(29), `base64`).toString()
    const metadata = JSON.parse(json)

    await store.addCollection({
      image: metadata.image,
      name: metadata.name,
      symbol: metadata.symbol,
      description: metadata.description,
      address,
      initBlock,
      latestTokenId,
      owner: owner.toLowerCase(),
    })
  }

  collection.value = await store.collection(address)

  loading.value = false
}

onMounted(() => load())
</script>

<style lang="postcss" scoped>
</style>
