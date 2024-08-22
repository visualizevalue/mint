<template>
  <Authenticated>
    <PageFrame
      :title="[
        {
          text: `Create New`
        }
      ]"
      class="inset"
    >

      <article class="preview">
        <div class="visual">
          <Image v-if="image" :src="image" alt="Preview" />
          <VisualImagePreview v-else />
        </div>
        <h1>
          <span :class="{ 'muted-light': !title }">{{ title || 'Token' }}</span>
          <small :class="{ 'muted-light': !symbol }">{{ symbol || '$T' }}</small>
        </h1>
        <p :class="{ 'muted-light': !description }">
          {{ description || 'No description' }}
        </p>
      </article>

      <form @submit.stop.prevent="deploy" class="card borderless">
        <div class="card">
          <div>
            <FormSelectFile @change="setImage" />
            <p v-if="! isSmall" class="muted"><small>Note: This should be a small file, prefferably a simple SVG like <a href="/example-contract-icon.svg" target="_blank">this one (273 bytes)</a>. Try to make it less than 10kb.</small></p>
          </div>
          <FormGroup>
            <FormInput v-model="title" placeholder="Title" required />
            <FormInput v-model="symbol" placeholder="Symbol" required />
          </FormGroup>
          <FormInput v-model="description" placeholder="Description" />
        </div>

        <Actions class="borderless">
          <TransactionFlow
            :request="deployRequest"
            :text="{
              title: {
                chain: 'Switch Chain',
                requesting: 'Confirm In Wallet',
                waiting: '2. Transaction Submitted',
                complete: '3. Success!'
              },
              lead: {
                chain: 'Requesting to switch chain...',
                requesting: 'Requesting Signature...',
                waiting: 'Checking Deployment Transaction...',
                complete: `New Collection Created...`,
              },
              action: {
                confirm: 'Mint',
                error: 'Retry',
                complete: 'OK',
              },
            }"
            @complete="deployed"
            skip-confirmation
            auto-close-success
          >
            <template #start="{ start }">
              <Button @click="start">
                Deploy
              </Button>
            </template>
          </TransactionFlow>
        </Actions>
      </form>

    </PageFrame>
  </Authenticated>
</template>

<script setup>
const config = useRuntimeConfig()
const store = useOnchainStore()
const chainId = useMainChainId()

const image = ref('')
const title = ref('')
const symbol = ref('')
const description = ref('')

const { $wagmi } = useNuxtApp()
const id = useArtistId()

const imageSize = ref(0)
const isSmall = computed(() => imageSize.value / 1024 < 10)
const setImage = async (file) => {
  try {
    image.value = await imageFileToDataUri(file)
  } catch (e) {
    image.value = ''
  }
  imageSize.value = file.size
}

const deployRequest = computed(() => async () => {
  return await writeContract($wagmi, {
    abi: FACTORY_ABI,
    chainId,
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
})

const deployed = async (receipt) => {
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

useMetaData({
  title: `Create New Collection`,
})
</script>

<style lang="postcss" scoped>
.preview {
  .visual {
    width: 5rem;
    margin-bottom: var(--spacer-sm);

    svg {
      border-radius: var(--border-radius);
      border: var(--border);
    }
  }

  h1 {
    display: flex;
    gap: var(--spacer-sm);
    align-items: baseline;
    font-size: var(--font-lg);

    small {
      font-size: var(--font-base);
      color: var(--muted);
    }
  }

  p {
    color: var(--muted);
  }
}

form {
  width: 100%;

  @media (--sm) {
    :deep(fieldset) {
      .form-item:last-child {
        width: max(42%, 9rem);
      }
    }
  }
}
</style>
