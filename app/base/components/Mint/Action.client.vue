<template>
  <Actions class="borderless">
    <Button @click="mint">Mint</Button>
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
    @complete="minted"
  />
</template>

<script setup>
const { $wagmi } = useNuxtApp()
const id = useArtistId()
const chainId = useMainChainId()
const store = useOnchainStore()

const props = defineProps({
  collection: Object,
  artifact: String,
  name: String,
  description: String,
})

const txFlow = ref()
const txFlowKey = ref(0)
const mint = async () => {
  if (! props.artifact) {
    alert(`Empty artifact data. Please try again.`)
    return
  }

  const artifact = toByteArray(props.artifact)
  const artifactChunks = chunkArray(artifact, 4)
  const multiTransactionPrepare = artifactChunks.length > 1

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
          address: props.collection.address,
          functionName: 'prepareArtifact',
          args: [
            props.collection.latestTokenId + 1n,
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

    await txFlow.value.initializeRequest(() => writeContract($wagmi, {
      abi: MINT_ABI,
      chainId,
      address: props.collection.address,
      functionName: 'create',
      args: [
        props.name,
        props.description,
        multiTransactionPrepare ? [] : artifact,
        0, // Renderer
        0n, // Additional Data
      ],
    }))
  } catch (e) {
    console.error(e)
  }
}

const minted = async (receipt) => {
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
}
</script>

<style scoped>
menu {
  justify-content: flex-end;

  @media (--md) {
    grid-column: 2;
  }
}
</style>
