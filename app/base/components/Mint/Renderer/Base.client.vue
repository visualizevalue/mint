<template>
  <div class="mint-renderer-base">
    <Actions>
      <select class="select choose-mode" v-model="mode">
        <option value="file" title="Data URI Encoded File Upload">Onchain Artifact</option>
        <option value="ipfs" title="Interplanetary File System">IPFS Identifier</option>
        <option value="ar" title="Arweave">Arweave Transaction</option>
      </select>
    </Actions>

    <div>
      <div v-if="mode === 'file'">
        <FormSelectFile ref="select" @change="setArtifact" />
        <p v-if="! isSmall" class="muted">
          <small>
            {{ $t('mint.base.note.start') }}
            <a href="https://presence.art/tokens/perspective.svg" target="_blank">{{ $t('mint.base.note.link_text') }}</a>.
            {{ $t('mint.base.note.end') }}
          </small>
        </p>
      </div>
      <FormInput v-else-if="mode === 'ipfs'" v-model="ipfsCid" placeholder="CID (qmx...)" prefix="ipfs://" required />
      <FormInput v-else-if="mode === 'ar'" v-model="arTxId" placeholder="TX ID (frV...)" prefix="ar://" required />

      <FormInput v-model="name" :placeholder="$t('mint.base.title_placeholder')" required />
      <FormInput v-model="description" :placeholder="$t('mint.base.description_placeholder')" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  decoupleArtifact: {
    type: Boolean,
    default: false,
  },
})

const {
  artifact,
  image,
  name,
  description,
} = useCreateMintData()

const select = ref()
const mode = ref('file')
const ipfsCid = ref('')
const arTxId= ref('')

const imageSize = ref(0)
const isSmall = computed(() => imageSize.value / 1024 < 10)
const setArtifact = async (file) => {
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
watch(arTxId, () => {
  image.value = `https://arweave.net/${arTxId.value}`
})
watch(mode, () => image.value = '')

watch(image, () => {
  if (props.decoupleArtifact) return

  // Copy to image (simple and stupid for the base renderer...)
  artifact.value = image.value

  // If artifact is empty, reset the select field
  if (! artifact.value) select.value.reset()
})
</script>

<style scoped>
  .mint-renderer-base {
    display: flex;
    flex-direction: column;
    gap: var(--spacer);
    height: 100%;

    > div {
      display: flex;
      height: 100%;
      flex-direction: column;
      justify-content: center;
      gap: var(--spacer);
    }
  }

  select.choose-mode {
    width: fit-content;
  }
</style>

