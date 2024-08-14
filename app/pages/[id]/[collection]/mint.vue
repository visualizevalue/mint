<template>
  <Authenticated>
    <PageFrame :title="[
      {
        text: `Collections`,
        to: `/${id}`
      },
      {
        text: collection.name,
        to: `/${id}/${collection.address}`
      },
      {
        text: `New Mint`
      }
    ]">
      <form @submit.stop.prevent="mint">
        <FormInput v-model="image" placeholder="Image" required />
        <FormInput v-model="name" placeholder="Title" required />
        <FormInput v-model="description" placeholder="Description" />

        <Button>Deploy</Button>
      </form>
    </PageFrame>
  </Authenticated>
</template>

<script setup>
const { $wagmi } = useNuxtApp()
const id = useArtistId()

const props = defineProps(['collection'])
const collection = computed(() => props.collection)

const config = useRuntimeConfig()
const store = useOnchainStore()

const image = ref('')
const name = ref('')
const description = ref('')

const mint = async () => {
  const hash = await writeContract($wagmi, {
    abi: MINT_ABI,
    chainId: 1337,
    address: collection.value.address,
    functionName: 'create', // function create(string tokenName, string tokenDescription, string tokenArtifact, uint32 tokenRenderer, uint192 tokenData)
    args: [
      name.value,
      description.value,
      splitIntoChunks(image.value),
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

  console.log(mintedEvent)
  console.log(mintedEvent.args, mintedEvent.args.id)

  // await store.fetchCollections(
  //   id.value,
  //   config.public.factoryAddress,
  //   store.artist(id.value).updatedAt,
  //   true
  // )
  // await navigateTo(`/${id.value}/${createdEvent.args.contractAddress}`)
}
</script>

<style lang="postcss" scoped>
form {
  width: 100%;
}
</style>
