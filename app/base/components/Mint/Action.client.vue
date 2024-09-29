<template>
  <form @submit.stop.prevent="mint" class="card">
    <slot />

    <Actions>
      <Button>Mint</Button>
    </Actions>
    <TransactionFlow
      ref="txFlow"
      :text="{
        title: {
          chain: 'Switch Chain',
          requesting: 'Confirm In Wallet',
          waiting: 'Transaction Submitted',
          complete: 'Success!'
        },
        lead: {
          chain: 'Requesting to switch chain...',
          requesting: 'Requesting Signature...',
          waiting: 'Checking mint Transaction...',
          complete: `New token minted...`,
        },
        action: {
          confirm: 'Mint',
          error: 'Retry',
          complete: 'OK',
        },
      }"
      skip-confirmation
      auto-close-success
    />
  </form>
</template>

<script setup>
const { $wagmi } = useNuxtApp()
const id = useArtistId()
const chainId = useMainChainId()
const store = useOnchainStore()

const props = defineProps({
  collection: Object,
  image: String,
  name: String,
  description: String,
})
const collection = computed(() => props.collection)
const image = computed(() => props.image)
const name = computed(() => props.name)
const description = computed(() => props.description)

const txFlow = ref()
const txFlowKey = ref(0)
const minting = ref(false)
const mint = async () => {
  if (! image.value) {
    alert(`Empty image data. Please try again.`)
    return
  }

  const artifact = toByteArray(image.value)
  const artifactChunks = chunkArray(artifact, 4)
  const multiTransactionPrepare = artifactChunks.length > 1

  minting.value = true

  try {
    if (multiTransactionPrepare) {
      if (! confirm(`Due to the large artifact size, we have to split it into ${artifactChunks.length} chunks and store them in separate transactions. You will be prompted with multiple transaction requests before minting the final token.`)) {
        return
      }

      // On the first iteration we want to clear existing artifact data
      let clearExisting = true

      for (const chunk of artifactChunks) {
        await txFlow.value.initializeRequest(() => writeContract($wagmi, {
          abi: MINT_ABI,
          chainId,
          address: collection.value.address,
          functionName: 'prepareArtifact',
          args: [
            collection.value.latestTokenId + 1n,
            chunk,
            clearExisting
          ],
        }))

        // Make sure to rerender the tx flow component
        txFlowKey.value ++

        // On following iterations we want to keep existing artifact data
        clearExisting = false
      }
    }

    const receipt = await txFlow.value.initializeRequest(() => writeContract($wagmi, {
      abi: MINT_ABI,
      chainId,
      address: collection.value.address,
      functionName: 'create',
      args: [
        name.value,
        description.value,
        multiTransactionPrepare ? [] : artifact,
        0, // Renderer
        0n, // Additional Data
      ],
    }))

    const logs = receipt.logs.map(log => decodeEventLog({
      abi: MINT_ABI,
      data: log.data,
      topics: log.topics,
      strict: false,
    }))

    const mintedEvent = logs.find(log => log.eventName === 'TransferSingle')

    await store.fetchToken(collection.value.address, mintedEvent.args.id)

    // Force update the collection mint ID
    store.collections[collection.value.address].latestTokenId = mintedEvent.args.id

    await navigateTo({
      name: 'id-collection-tokenId',
      params: { id: id.value, collection: collection.value.address, tokenId: mintedEvent.args.id }
    })
  } catch (e) {
    console.error(e)
  }

  minting.value = false
}
</script>
