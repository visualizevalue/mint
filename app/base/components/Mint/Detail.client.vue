<template>
  <MintPreview
    :name="name"
    :description="description"
    :image="image"
    :animation-url="animationUrl"
  />

  <MintRendererBase
    :v-model:artifact="artifact"
    :v-model:image="image"
    :v-model:name="name"
    :v-model:description="description"
    class="card"
  />

  <MintAction
    :artifact="artifact"
    :name="name"
    :description="description"
    :collection="collection"
  />
</template>

<script setup>
const props = defineProps(['collection'])

const artifact = ref('')
const name = ref('')
const description = ref('')

const image = ref('')
const animationUrl = ref('')
</script>

