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
        <img v-if="image" :src="image" alt="Preview">
        <VisualImagePreview v-else />
        <h1>
          <span :class="{ 'muted-light': !title }">{{ title || 'Token' }}</span>
          <small :class="{ 'muted-light': !symbol }">{{ symbol || '$T' }}</small>
        </h1>
        <p v-if="description" :class="{ 'muted-light': !description }">
          {{ description || 'Lorem ipsum dolor sit amet consectetur, adipisicing elit.' }}
        </p>
      </article>

      <section>
        <form @submit.stop.prevent="deploy">
          <div>
            <FormSelectFile @change="setImage" />
            <p v-if="! isSmall" class="muted"><small>Note: This should be a small file, prefferably a simple SVG like <a href="/example-contract-icon.svg" target="_blank">this one (273 bytes)</a>. Try to make it less than 10kb.</small></p>
          </div>
          <FormGroup>
            <FormInput v-model="title" placeholder="Title" required />
            <FormInput v-model="symbol" placeholder="Symbol" required />
          </FormGroup>
          <FormInput v-model="description" placeholder="Description" />
        </form>
      </section>

      <Actions class="borderless">
        <Button @click="deploy">Deploy</Button>
      </Actions>

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

const imageSize = ref(0)
const isSmall = computed(() => imageSize.value / 1024 < 10)
const setImage = async (file) => {
  image.value = await imageFileToDataUri(file)
  imageSize.value = file.size
}

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

useMetaData({
  title: `Create New Collection`,
})
</script>

<style lang="postcss" scoped>
.frame {
  /* gap: var(--spacer); */

  @media (--md) {
    /* display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr)); */
  }
}

.preview {
  img,
  svg {
    width: 5rem;
    border-radius: var(--border-radius);
    border: var(--border);
    margin-bottom: var(--spacer-sm);
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
