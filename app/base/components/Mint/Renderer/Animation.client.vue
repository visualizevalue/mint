<template>
  <div class="mint-renderer-base">
    <Actions>
      <select class="select choose-mode" v-model="mode">
        <option value="ipfs" title="Interplanetary File System">IPFS Identifier</option>
        <option value="ar" title="Arweave">Arweave Transaction</option>
        <option value="file" title="Data URI Encoded File Upload">Onchain Artifact</option>
      </select>
    </Actions>

    <div>
      <label>
        <span>Image</span>

        <FormInput v-if="mode === 'ipfs'" v-model="imageIpfsCid" placeholder="CID (qmx...)" prefix="ipfs://" required />
        <FormInput v-else-if="mode === 'ar'" v-model="imageArTxId" placeholder="TX ID (frV...)" prefix="ar://" required />
        <div v-else-if="mode === 'file'">
          <FormSelectFile ref="imageSelect" @change="setImageArtifact" />
          <p v-if="! imageIsSmall" class="muted">
            <small>
              {{ $t('mint.base.note.start') }}
              <a href="https://presence.art/tokens/perspective.svg" target="_blank">{{ $t('mint.base.note.link_text') }}</a>.
              {{ $t('mint.base.note.end') }}
            </small>
          </p>
        </div>
      </label>

      <label>
        <span>Animation</span>

        <FormInput v-if="mode === 'ipfs'" v-model="animationIpfsCid" placeholder="CID (qmx...)" prefix="ipfs://" required />
        <FormInput v-else-if="mode === 'ar'" v-model="animationArTxId" placeholder="TX ID (frV...)" prefix="ar://" required />
        <div v-else-if="mode === 'file'">
          <FormSelectFile ref="animationSelect" @change="setAnimationArtifact" />
          <p v-if="! animationIsSmall" class="muted">
            <small>
              {{ $t('mint.base.note.start') }}
              <a href="https://presence.art/tokens/perspective.svg" target="_blank">{{ $t('mint.base.note.link_text') }}</a>.
              {{ $t('mint.base.note.end') }}
            </small>
          </p>
        </div>
      </label>

      <FormInput v-model="name" :placeholder="$t('mint.base.title_placeholder')" required />
      <FormInput v-model="description" :placeholder="$t('mint.base.description_placeholder')" />
    </div>
  </div>
</template>

<script setup>
const {
  artifact,
  image,
  name,
  animationUrl,
  description,
} = useCreateMintData()

const mode = ref('ipfs')

const imageSelect = ref()
const imageIpfsCid = ref('')
const imageArTxId= ref('')

const animationSelect = ref()
const animationIpfsCid = ref('')
const animationArTxId= ref('')

const imageSize = ref(0)
const imageIsSmall = computed(() => imageSize.value / 1024 < 10)
const setImageArtifact = async (file) => {
  try {
    image.value = await imageFileToDataUri(file)
    imageSize.value = file.size
  } catch (e) {
    image.value = ''
    imageSize.value = 0
  }
}
const animationSize = ref(0)
const animationIsSmall = computed(() => animationSize.value / 1024 < 10)
const setAnimationArtifact = async (file) => {
  try {
    animationUrl.value = await imageFileToDataUri(file)
    animationSize.value = file.size
  } catch (e) {
    animationUrl.value = ''
    animationSize.value = 0
  }
}

watch(imageIpfsCid, () => {
  const validated = validateCID(imageIpfsCid.value)
  if (! validated) {
    image.value = ''
  } else {
    image.value = ipfsToHttpURI(`ipfs://${validated}`)
  }
})
watch(imageArTxId, () => {
  image.value = `https://arweave.net/${imageArTxId.value}`
})
watch(mode, () => image.value = '')

watch(animationIpfsCid, () => {
  const validated = validateCID(animationIpfsCid.value)
  if (! validated) {
    animationUrl.value = ''
  } else {
    animationUrl.value = ipfsToHttpURI(`ipfs://${validated}`)
  }
})
watch(animationArTxId, () => {
  animationUrl.value = `https://arweave.net/${animationArTxId.value}`
})
watch(mode, () => {
  image.value = ''
  animationUrl.value = ''
})

// Encode the artifact as per how the P5Renderer.sol contract expects it.
watchEffect(() => {
  artifact.value = encodeAbiParameters(
    [ { type: 'string', name: 'image' }, { type: 'string', name: 'animation' } ],
    [ image.value, animationUrl.value ],
  )
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

