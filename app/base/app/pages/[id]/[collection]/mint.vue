<template>
  <Authenticated>
    <PageFrame :title="breadcrumb" class="inset wide" id="mint-token">
      <article class="preview">
        <Image v-if="image" :src="image" alt="Preview" />
        <VisualImagePreview v-else />
        <h1 :class="{ '': !name }">{{ name || 'Token' }}</h1>
        <p :class="{ '': !description }">
          {{ description || 'No description' }}
        </p>
      </article>

      <form @submit.stop.prevent="mint" class="card">
        <Actions>
          <select class="select small choose-mode" v-model="mode">
            <option value="file" title="Data URI Encoded File Upload">DATA-URI</option>
            <option value="ipfs" title="Interplanetary File System">IPFS</option>
            <option value="http" title="Hypertext Transfer Protocol" disabled>HTTP</option>
            <option value="svg" title="Scalable Vector Graphic" disabled>SVG</option>
          </select>
        </Actions>

        <div>
          <div v-if="mode === 'file'">
            <FormSelectFile @change="setImage" />
            <p v-if="! isSmall" class="muted">
              <small>
                Note: This should be a small file, prefferably an SVG like <a href="https://presence.art/tokens/perspective.svg" target="_blank">this one (810 bytes)</a>.
                If it is larger than what we can store within one transaction, the token creation will be split up into multiple transactions.
              </small>
            </p>
          </div>
          <FormInput v-else-if="mode === 'ipfs'" v-model="ipfsCid" placeholder="CID (qmx...)" prefix="ipfs://" required />

          <FormInput v-model="name" placeholder="Title" required />
          <FormInput v-model="description" placeholder="Description" />
        </div>

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

    </PageFrame>
  </Authenticated>
</template>

<script setup>
const { $wagmi } = useNuxtApp()
const id = useArtistId()
const chainId = useMainChainId()

const props = defineProps(['collection'])
const store = useOnchainStore()
const collection = computed(() => props.collection)

const mode = ref('file')
const ipfsCid = ref('')
const image = ref('')
const name = ref('')
const description = ref('')

const imageSize = ref(0)
const isSmall = computed(() => imageSize.value / 1024 < 10)
const setImage = async (file) => {
  try {
    image.value = await imageFileToDataUri(file)
    imageSize.value = file.size
  } catch (e) {
    image.value = ''
    imageSize.value = 0
  }
}
watch(ipfsCid, () => {
  const validated = validateCID(ipfsCid.value)
  if (! validated) {
    image.value = ''
  } else {
    image.value = ipfsToHttpURI(`ipfs://${validated}`)
  }
})
watch(mode, () => image.value = '')

const txFlow = ref()
const txFlowKey = ref(0)
const minting = ref(false)
const mint = async () => {
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
        0,
        0n,
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

const subdomain = useSubdomain()
const isMe = useIsMe()

const breadcrumb = computed(() => {
  const path = subdomain.value || isMe.value ? [] : [
    {
      text: store.displayName(id.value),
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

<style scoped>
#mint-token {
  display: grid;

  @media (--md) {
    grid-template-columns: 40% 1fr;
  }

  @media (--lg) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.preview {
  height: 100%;
  place-content: center;

  .image,
  svg {
    margin-bottom: var(--spacer-sm);
    width: 100%;
  }

  svg {
    box-shadow: var(--border-shadow);
  }

  h1 {
    display: flex;
    gap: var(--spacer-sm);
    align-items: baseline;
    font-size: var(--font-lg);
  }

  p {
    color: var(--muted);
  }
}

form {
  width: 100%;

  > div {
    display: grid;
    gap: var(--spacer);
  }
}

select.choose-mode {
  width: fit-content;
}
</style>
