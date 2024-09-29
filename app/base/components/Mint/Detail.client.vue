<template>
  <div class="mint-detail">
    <MintPreview
      :image="image"
      :name="name"
      :description="description"
    />

    <MintAction
      :image="image"
      :name="name"
      :description="description"
      :collection="collection"
    >
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
          <FormSelectFile @change="setImage" />
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
    </MintAction>
  </div>
</template>

<script setup>
const props = defineProps(['collection'])

const mode = ref('file')
const ipfsCid = ref('')
// TODO: Rework to plugin architecture. Or at least per renderer logic.
const arTxId= ref('')
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
watch(arTxId, () => {
  image.value = `https://arweave.net/${arTxId.value}`
})
watch(mode, () => image.value = '')

</script>

<style>
.mint-detail {
  display: grid;

  @media (--md) {
    grid-template-columns: 40% 1fr;
  }

  @media (--lg) {
  }
    grid-template-columns: repeat(2, minmax(0, 1fr));

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
}
</style>
