<template>
  <div class="mint-renderer-p5">
    <Tabs initial="base">

      <template #menu="{ active, select }">
        <Button
          @click="select('base')"
          :class="{ active: active === 'base' }"
        >Static</Button>
        <Button
          @click="select('script')"
          :class="{ active: active === 'script' }"
        >P5 Script</Button>
      </template>

      <template #content="{ active }">
        <!-- We only hide the form to maintain the file select state -->
        <MintRendererBase v-show="active === 'base'" decouple-artifact />
        <!-- We force rerender the code editor on active -->
        <CodeEditor v-if="active === 'script'" v-model="script" class="full" ref="codeEditor" />
      </template>

    </Tabs>
  </div>
</template>

<script setup>
import { watchDebounced } from '@vueuse/core'

const {
  artifact,
  image,
  animationUrl,
} = useCreateMintData()

const script = ref(DEFAULT_P5_SCRIPT)

// Keep the animationURL (for the preview) up to date
const updateUrl = () => {
  animationUrl.value = getP5HtmlUri('Preview', script.value)
}
watchDebounced(
  script,
  updateUrl,
  { debounce: 500, maxWait: 3000 },
)
onMounted(updateUrl)

// Encode the artifact as per how the P5Renderer.sol contract expects it.
watchEffect(() => {
  artifact.value = encodeAbiParameters(
    [ { type: 'string', name: 'image' }, { type: 'string', name: 'script' } ],
    [ image.value, script.value ],
  )
})
</script>

<style>
.mint-renderer-p5 {
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

