<template>
  <Authenticated>
    <PageFrame :title="breadcrumb">
      <form @submit.stop.prevent="mint">
        <FormInput v-model="image" placeholder="Image" required />
        <FormInput v-model="name" placeholder="Title" required />
        <FormInput v-model="description" placeholder="Description" />

        <Actions>
          <Button>Mint</Button>
        </Actions>
      </form>
    </PageFrame>
  </Authenticated>
</template>

<script setup>
const { $wagmi } = useNuxtApp()
const id = useArtistId()

const props = defineProps(['collection'])
const store = useOnchainStore()
const collection = computed(() => props.collection)

const image = ref('')
const name = ref('')
const description = ref('')

const mint = async () => {
  const artifact = toByteArray(image.value)
  const artifactChunks = chunkArray(artifact, 4)
  const multiTransactionPrepare = artifactChunks.length > 1

  if (multiTransactionPrepare) {
    if (! confirm(`Due to the large artifact size, we have to split it into ${artifactChunks.length} chunks and store them in separate transactions. You will be prompted with multiple transaction requests before minting the final token.`)) {
      return
    }

    for (const chunk of artifactChunks) {
      const hash = await writeContract($wagmi, {
        abi: MINT_ABI,
        chainId: 1337,
        address: collection.value.address,
        functionName: 'prepareArtifact',
        args: [
          collection.value.latestTokenId + 1n,
          chunk,
          false
        ],
      })

      await waitForTransactionReceipt($wagmi, { chainId: 1337, hash })
    }
  }

  const hash = await writeContract($wagmi, {
    abi: MINT_ABI,
    chainId: 1337,
    address: collection.value.address,
    functionName: 'create',
    args: [
      name.value,
      description.value,
      multiTransactionPrepare ? [] : artifact,
      0,
      0n,
    ],
  })

  const receipt = await waitForTransactionReceipt($wagmi, {
    chainId: 1337,
    hash,
  })

  const logs = receipt.logs.map(log => decodeEventLog({
    abi: MINT_ABI,
    data: log.data,
    topics: log.topics,
    strict: false,
  }))

  const mintedEvent = logs.find(log => log.eventName === 'TransferSingle')

  await store.fetchToken(collection.value.address, mintedEvent.args.id)
  await navigateTo(`/${id.value}/${collection.value.address}`)
}


const subdomain = useSubdomain()
const isMe = useIsMe()
const artistName = useAccountName(id.value)

const breadcrumb = computed(() => {
  const path = subdomain.value || isMe.value ? [] : [
    {
      text: artistName,
      to: { name: 'id', params: { id: id.value } }
    }
  ]

  return [
    ...path,
    {
      text: `${ collection.value.name }`,
      to: { name: 'id-collection', params: { id: id.value, collection: collection.value.address } }
    },
    {
      text: `New Mint`
    },
  ]
})

useMetaData({
  title: `Mint New Token | ${collection.value.name}`,
})
</script>

<style lang="postcss" scoped>
form {
  width: 100%;
}
</style>
