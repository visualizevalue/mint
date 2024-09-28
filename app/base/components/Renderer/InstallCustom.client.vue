<template>
  <article class="install-custom-renderer">
    <h1>Add Custom Renderer</h1>
    <FormInput v-model="rendererAddressInput" placeholder="0x..." />

    <Loading v-if="loading" />
    <RendererOverviewCard
      v-else-if="rendererAddress && rendererName"
      :renderer="renderer"
    >
      <template #after>
        <RendererInstallRendererButton
          :collection="collection"
          :renderer="renderer"
          #after
        />
      </template>
    </RendererOverviewCard>
  </article>
</template>

<script setup>
const { $wagmi } = useNuxtApp()
const chainId = useMainChainId()
const { collection } = defineProps(['collection'])

const rendererAddressInput = ref(``)
const rendererAddress = ref()
const rendererName = ref()
const rendererVersion = ref()

const renderer = computed(() => ({
  address: rendererAddress.value,
  name: rendererName.value,
  version: rendererVersion.value,
}))

watch(rendererAddressInput, () => {
  if (isAddress(rendererAddressInput.value)) {
    rendererAddress.value = rendererAddressInput.value
  } else {
    rendererAddress.value = ``
  }
})

const loading = ref(false)
watch(rendererAddress, async () => {
  if (! rendererAddress.value) {
    rendererName.value = ''
    rendererVersion.value = null
    return
  }

  loading.value = true

  try {
    const rendererArgs = {
      abi: RENDERER_ABI,
      address: rendererAddress.value,
      chainId
    }

    const [name, version] = await Promise.all([
      await readContract($wagmi, {
        ...rendererArgs,
        functionName: 'name',
      }),
      await readContract($wagmi, {
        ...rendererArgs,
        functionName: 'version',
      }),
    ])

    rendererName.value = name
    rendererVersion.value = version
  } catch (e) {
    console.error(e)
  }

  loading.value = false
})
</script>

<style scoped>
.install-custom-renderer {
  padding: var(--spacer);
  border: var(--border);
  display: grid;
  gap: var(--spacer);
}
</style>
