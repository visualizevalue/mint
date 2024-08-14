<template>
  <PageFrame :title="[
    {
      text: `Collections`,
      to: `/${id}`
    },
    {
      text: `${ collection?.name }`
    }
  ]">
    <header v-if="isMe">
      <menu>
        <Button :to="`/${id}/${collection.address}/mint`">Create New</Button>
      </menu>
    </header>

    <section>
      <img v-if="collection.image" :src="collection.image" :alt="collection.name">
      <h1>{{ collection.name }} <small>{{ collection.symbol }}</small></h1>
      <p>{{ collection.description }}</p>
      <p>Init Block: {{ collection.initBlock }}</p>
      <p>Latest Token: {{ collection.latestTokenId }}</p>
      <p>Owner: {{ collection.owner }}</p>
    </section>
    <section>
      No tokens yet
    </section>
  </PageFrame>
</template>

<script setup>
const id = useArtistId()
const isMe = useIsMe()

const props = defineProps(['collection'])
const collection = computed(() => props.collection)

// Encoding example.
onMounted(() => {
  const myString = [...new Array(600)].map(() => "Hello, World! This is a long string that might exceed the limit...").join('')
  const bytesArray = splitIntoChunks(myString)

  const encodedData = encodeAbiParameters(
    [
      { name: 'foo', type: 'bytes[]' },
    ],
    [bytesArray]
  )

  console.log(encodedData, bytesArray, bytesArray.map(h => toBytes(h)))
})
</script>

<style lang="postcss" scoped>
</style>
