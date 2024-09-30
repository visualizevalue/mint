import type { TransactionReceipt } from "viem"

// Base token data
const name        = ref('')
const artifact    = ref('')
const description = ref('')

// Derived data based on artifact // renderer
const image        = ref('')
const animationUrl = ref('')

// Renderer data
const renderer  = ref(0)
const extraData = ref(0n)

// Main token creation composable
export const useCreateMintData = () => {
  // Reset the creation form values
  const reset = () => {
    name.value = ''
    artifact.value = ''
    description.value = ''

    image.value = ''
    animationUrl.value = ''

    renderer.value = 0
    extraData.value = 0n
  }

  return {
    name,
    artifact,
    description,
    image,
    animationUrl,
    renderer,
    extraData,

    reset,
  }
}

// Token creation flow
export const useCreateMintFlow = (collection: Collection, txFlow: Ref) => {
  const { $wagmi } = useNuxtApp()
  const id = useArtistId()
  const chainId = useMainChainId()
  const store = useOnchainStore()

  // Mint flow
  const txFlowKey = ref(0)
  const mint = async () => {
    if (! artifact.value) {
      alert(`Empty artifact data. Please try again.`)
      return
    }

    const artifactByteArray = toByteArray(artifact.value)
    const artifactChunks = chunkArray(artifactByteArray, 4)
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
            address: collection.address,
            functionName: 'prepareArtifact',
            args: [
              collection.latestTokenId + 1n,
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
        address: collection.address,
        functionName: 'create',
        args: [
          name.value,
          description.value,
          multiTransactionPrepare ? [] : artifactByteArray,
          0, // Renderer
          0n, // Additional Data
        ],
      }))
    } catch (e) {
      console.error(e)
    }
  }

  // On created
  const mintCreated = async (receipt: TransactionReceipt) => {
    const logs = receipt.logs.map(log => decodeEventLog({
      abi: MINT_ABI,
      data: log.data,
      topics: log.topics,
      strict: false,
    }))

    const mintedEvent = logs.find(log => log.eventName === 'TransferSingle')

    await store.fetchToken(collection.address, mintedEvent.args.id)

    // Force update the collection mint ID
    store.collections[collection.address].latestTokenId = mintedEvent.args.id

    await navigateTo({
      name: 'id-collection-tokenId',
      params: { id: id.value, collection: collection.address, tokenId: mintedEvent.args.id }
    })
  }

  return {
    mint,
    mintCreated,
  }
}

