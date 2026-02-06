<template>
  <div class="mint-renderer-markdown">
    <div class="fields">
      <FormInput v-model="name" :placeholder="$t('mint.base.title_placeholder')" required />
      <FormInput v-model="description" :placeholder="$t('mint.base.description_placeholder')" />
    </div>

    <CodeEditor
      v-model="markdown"
      mode="text/x-markdown"
      :placeholder="$t('mint.markdown.placeholder')"
      class="full"
    />
  </div>
</template>

<script setup>
import { watchDebounced } from '@vueuse/core'

const { artifact, animationUrl, name, description } = useCreateMintData()

const markdown = ref('')

// Generate a preview HTML data URI for the markdown content.
const updatePreview = () => {
  if (! markdown.value) {
    animationUrl.value = ''
    return
  }

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: monospace;
    font-size: 14px;
    color: #999;
    background: #111;
    padding: 2rem;
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
</head>
<body>${markdown.value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
</html>`

  animationUrl.value = `data:text/html;base64,${btoa(unescape(encodeURIComponent(html)))}`
}
watchDebounced(markdown, updatePreview, { debounce: 500, maxWait: 3000 })

// Set the artifact to the raw markdown text.
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

  > .fields {
    display: flex;
    flex-direction: column;
    gap: var(--spacer);
    padding: var(--spacer);
    border: var(--border);
    border-radius: var(--card-border-radius);
  }

  > .code-editor {
    border: var(--border);
    border-radius: var(--card-border-radius);
    overflow: hidden;
    min-height: 24rem;
  }
}
</style>
