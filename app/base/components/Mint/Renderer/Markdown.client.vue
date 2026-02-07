<template>
  <div class="mint-renderer-markdown">
    <div class="fields">
      <FormInput v-model="name" :placeholder="$t('mint.base.title_placeholder')" required />
      <FormInput v-model="description" :placeholder="$t('mint.base.description_placeholder')" />
    </div>

    <CodeEditor v-model="markdown" mode="text/x-markdown" :placeholder="$t('mint.markdown.placeholder')" class="full" />
  </div>
</template>

<script setup>
import { watchDebounced } from '@vueuse/core'
import { getMarkdownSvgUri, getMarkdownUri } from '~/utils/markdown'

const { artifact, image, animationUrl, name, description } = useCreateMintData()

const markdown = ref('')

const updatePreview = () => {
  if (!markdown.value) {
    image.value = ''
    animationUrl.value = ''
    return
  }

  image.value = getMarkdownSvgUri(name.value || '', markdown.value)
  animationUrl.value = getMarkdownUri(markdown.value)
}
watchDebounced([markdown, name], updatePreview, { debounce: 500, maxWait: 3000 })

// The MarkdownRenderer contract stores raw markdown bytes (not ABI-encoded).
watchEffect(() => {
  artifact.value = markdown.value
})
</script>

<style>
.mint-renderer-markdown {
  padding: 0 !important;
  border: 0 !important;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
  width: 100%;

  >.fields {
    display: flex;
    flex-direction: column;
    gap: var(--spacer);
    padding: var(--spacer);
    border: var(--border);
    border-radius: var(--card-border-radius);
  }

  >.code-editor {
    border: var(--border);
    border-top: none;
    border-radius: var(--card-border-radius);
    overflow: hidden;
    min-height: 24rem;
  }
}
</style>
