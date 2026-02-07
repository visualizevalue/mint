<template>
  <div class="mint-renderer-script">
    <Tabs initial="base">
      <template #menu="{ active, select }">
        <Button @click="select('base')" :class="{ active: active === 'base' }">
          {{ $t(`mint.${i18nKey}.static`) }}
        </Button>
        <Button @click="select('script')" :class="{ active: active === 'script' }">
          {{ $t(`mint.${i18nKey}.script`) }}
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

const props = defineProps({
  i18nKey: { type: String, required: true },
  defaultScript: { type: String, required: true },
  getHtmlUri: { type: Function, required: true },
})

const { artifact, image, animationUrl } = useCreateMintData()

const script = ref(props.defaultScript)

// Keep the animationURL (for the preview) up to date
const updateUrl = () => {
  animationUrl.value = props.getHtmlUri('Preview', script.value)
}
watchDebounced(script, updateUrl, { debounce: 500, maxWait: 3000 })
onMounted(updateUrl)

// Encode the artifact as per how the renderer contract expects it.
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
.mint-renderer-script {
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
