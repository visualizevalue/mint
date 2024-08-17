<template>
  <Authenticated>
    <PageFrame :title="[
      {
        text: `Collections`,
        to: { name: 'id', params: { id } }
      },
      {
        text: `Create New`
      }
    ]">
      <form @submit.stop.prevent="deploy">
        <FormInput v-model="image" placeholder="Image" />
        <FormInput v-model="title" placeholder="Title" required />
        <FormInput v-model="symbol" placeholder="Symbol" required />
        <FormInput v-model="description" placeholder="Description" />

        <Button>Deploy</Button>
      </form>
    </PageFrame>
  </Authenticated>
</template>

<script setup>
const config = useRuntimeConfig()
const store = useOnchainStore()

const image = ref('')
const title = ref('')
const symbol = ref('')
const description = ref('')

const { $wagmi } = useNuxtApp()
const id = useArtistId()

const deploy = async () => {
  const hash = await writeContract($wagmi, {
    abi: FACTORY_ABI,
    chainId: 1337,
    address: config.public.factoryAddress,
    functionName: 'create',
    args: [
      title.value,
      symbol.value,
      description.value,
      image.value,
    ],
    gasMultiplier: 2, // TODO: Disable
  })

  const receipt = await waitForTransactionReceipt($wagmi, {
    chainId: 1337,
    hash,
  })

  const logs = receipt.logs.map(log => decodeEventLog({
    abi: [...FACTORY_ABI, ...MINT_ABI],
    data: log.data,
    topics: log.topics,
    strict: false,
  }))

  const createdEvent = logs.find(log => log.eventName === 'Created')

  const artist = store.artist(id.value)
  await store.fetchCollections(id.value, config.public.factoryAddress, artist.collectionsFetchedUntilBlock)
  await navigateTo(`/${id.value}/${createdEvent.args.contractAddress}`)
}
</script>

<style lang="postcss" scoped>
form {
  width: 100%;
}
</style>
