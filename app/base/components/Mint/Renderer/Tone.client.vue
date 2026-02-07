<template>
  <div class="mint-renderer-tone">
    <Tabs initial="base">
      <template #menu="{ active, select }">
        <Button @click="select('base')" :class="{ active: active === 'base' }">
          {{ $t('mint.tone.static') }}
        </Button>
        <Button @click="select('script')" :class="{ active: active === 'script' }">
          {{ $t('mint.tone.script') }}
        </Button>
      </template>

      <template #content="{ active }">
        <!-- We only hide the form to maintain the file select state -->
        <MintRendererBase v-show="active === 'base'" decouple-artifact />
        <!-- We force rerender the code editor on active -->
        <CodeEditor
          v-if="active === 'script'"
          v-model="script"
          class="full"
          ref="codeEditor"
        />
      </template>
    </Tabs>
  </div>
</template>

<script setup>
import { watchDebounced } from '@vueuse/core'
import { getToneHtmlUri, DEFAULT_TONE_SCRIPT } from '~/utils/toneScript'

const { artifact, image, animationUrl } = useCreateMintData()

const script = ref(DEFAULT_TONE_SCRIPT)

// Keep the animationURL (for the preview) up to date
const updateUrl = () => {
  animationUrl.value = getToneHtmlUri('Preview', script.value)
}
watchDebounced(script, updateUrl, { debounce: 500, maxWait: 3000 })
onMounted(updateUrl)

// Encode the artifact as per how the ToneRenderer.sol contract expects it.
watchEffect(() => {
  artifact.value = encodeAbiParameters(
    [
      { type: 'string', name: 'image' },
      { type: 'string', name: 'script' },
    ],
    [image.value, script.value],
  )
})
</script>

<style>
.mint-renderer-tone {
  padding: 0 !important;
  border: 0 !important;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
  width: 100%;

  > .tabs {
    height: min-content;
  }

  > .tabs-content {
    border: var(--border);
    border-radius: var(--card-border-radius);
    overflow: hidden;
    height: 100%;

    > * {
      height: 100%;
    }

    > *:not(.full) {
      padding: var(--spacer);
    }
  }
}
</style>
