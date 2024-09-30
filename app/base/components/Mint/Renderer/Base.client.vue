<template>
  <div class="mint-renderer-base">
    <Actions>
      <select class="select choose-mode" v-model="mode">
        <option value="file" title="Data URI Encoded File Upload">DATA-URI</option>
        <option value="ipfs" title="Interplanetary File System">IPFS</option>
        <option value="ar" title="Arweave">ARWEAVE</option>
        <option value="http" title="Hypertext Transfer Protocol" disabled>HTTP</option>
        <option value="svg" title="Scalable Vector Graphic" disabled>SVG</option>
      </select>
    </Actions>

    <div>
      <div v-if="mode === 'file'">
        <FormSelectFile @change="setArtifact" />
        <p v-if="! isSmall" class="muted">
          <small>
            Note: This should be a small file, prefferably an SVG like <a href="https://presence.art/tokens/perspective.svg" target="_blank">this one (810 bytes)</a>.
            If it is larger than what we can store within one transaction, the token creation will be split up into multiple transactions.
          </small>
        </p>
      </div>
      <FormInput v-else-if="mode === 'ipfs'" v-model="ipfsCid" placeholder="CID (qmx...)" prefix="ipfs://" required />
      <FormInput v-else-if="mode === 'ar'" v-model="arTxId" placeholder="TX ID (frV...)" prefix="ar://" required />

      <FormInput v-model="name" placeholder="Title" required />
      <FormInput v-model="description" placeholder="Description" />
    </div>
  </div>
</template>


<script setup>
const artifact = defineModel('artifact')
const name = defineModel('name')
const description = defineModel('description')
const image = defineModel('image')

const mode = ref('file')
const ipfsCid = ref('')
const arTxId= ref('')

const artifactSize = ref(0)
const isSmall = computed(() => artifactSize.value / 1024 < 10)
const setArtifact = async (file) => {
  try {
    artifact.value = await imageFileToDataUri(file)
    artifactSize.value = file.size
  } catch (e) {
    artifact.value = ''
    artifactSize.value = 0
  }
}
watch(ipfsCid, () => {
  const validated = validateCID(ipfsCid.value)
  if (! validated) {
    artifact.value = ''
  } else {
    artifact.value = ipfsToHttpURI(`ipfs://${validated}`)
  }
})
watch(arTxId, () => {
  artifact.value = `https://arweave.net/${arTxId.value}`
})
watch(mode, () => artifact.value = '')

// Simple and stupid for the base renderer..
watch(artifact, () => image.value = artifact.value)
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

