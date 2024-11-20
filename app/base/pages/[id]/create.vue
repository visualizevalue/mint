<template>
  <Authenticated>
    <PageFrame
      :title="[
        {
          text: $t('create.title')
        }
      ]"
      class="inset"
    >

      <Alert dismiss="create-new-collection-info">
        <h1>{{ $t('create.alert_new.title') }}</h1>
        <p>{{ $t('create.alert_new.text') }}</p>
      </Alert>

      <article class="preview">
        <div class="visual">
          <Image v-if="image" :src="image" alt="Preview" />
          <ImagePreview v-else />
        </div>
        <h1>
          <span :class="{ '': !title }">{{ title || $t('create.preview.collection') }}</span>
          <small :class="{ '': !symbol }">{{ symbol || '$SYM' }}</small>
        </h1>
        <p :class="{ '': !description }">
          {{ description || $t('create.preview.no_description') }}
        </p>
      </article>

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
          <form @submit.stop.prevent="start" class="card borderless">
            <div class="card">
              <div>
                <FormSelectFile @change="setImage" />
                <p v-if="! isSmall" class="muted">
                  <small> {{ $t('create.note.start') }} <a :href="`${base}example-contract-icon.svg`" target="_blank">{{ $t('create.note.link_text') }}</a>. {{ $t('create.note.end') }}</small>
                </p>
              </div>
              <FormGroup>
                <FormInput v-model="title" :placeholder="$t('create.form.title_placeholder')" required class="title" />
                <FormInput v-model="symbol" :placeholder="$t('create.form.symbol_placeholder')" required />
              </FormGroup>
              <FormInput v-model="description" :placeholder="$t('create.form.description_placeholder')" />

              <hr>

              <div class="creation-type">
                <div class="radio form-group">
                  <input type="radio" id="creation-type-create" value="create" v-model="creationType" />
                  <label for="creation-type-create">{{ $t('create.form.deploy_method.create') }}</label>

                  <input type="radio" id="creation-type-clone" value="clone" v-model="creationType" />
                  <label for="creation-type-clone">{{ $t('create.form.deploy_method.clone') }}</label>
                </div>
                <p v-if="creationType === 'create'">{{ $t('create.form.deploy_method.note_create') }}</p>
                <p v-else>{{ $t('create.form.deploy_method.note_clone') }}</p>
              </div>
            </div>

            <Actions>
              <Button type="submit">
                {{ $t('create.form.deploy_button') }}
              </Button>
            </Actions>
          </form>
        </template>
      </TransactionFlow>

    </PageFrame>
  </Authenticated>
</template>

<script setup>
const config = useRuntimeConfig()
const base = useBaseURL()
const store = useOnchainStore()
const chainId = useMainChainId()

const image = ref('')
const title = ref('')
const symbol = ref('')
const description = ref('')
const creationType = ref('create')

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
    functionName: creationType.value,
    args: [
      sanitizeForJson(title.value),
      sanitizeForJson(symbol.value),
      sanitizeForJson(description.value),
      toByteArray(image.value),
    ],
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
  await navigateTo({
    name: 'id-collection',
    params: { id: id.value, collection: createdEvent.args.contractAddress }
  })
}

useMetaData({
  title: `Create New Collection`,
})
</script>

<style scoped>
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

  :deep(fieldset) {
    @container (min-width: 30rem) {
      .title {
        width: 100%;
      }
    }
  }
}

.creation-type {
  p {
    font-size: var(--font-sm);
  }
}
</style>
