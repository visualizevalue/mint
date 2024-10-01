<template>
  <div class="mint-renderer-p5">

    <Tabs initial="base">
      <template #menu="{ active, select }">
        <Button @click="select('base')" :class="{ active: active === 'base' }">Static</Button>
        <Button @click="select('script')" :class="{ active: active === 'script' }">P5 Script</Button>
      </template>
      <template #content="{ active }">
        <MintRendererBase v-show="active === 'base'" decouple-artifact />
        <CodeEditor v-show="active === 'script'" v-model="script" class="full" />
      </template>
    </Tabs>
  </div>
</template>

<script setup>
const {
  artifact,
  image,
  animationUrl,
} = useCreateMintData()

const script = ref(DEFAULT_P5_SCRIPT)

// Keep the animationURL (for the preview) up to date
watchEffect(() => {
  animationUrl.value = getP5HtmlUri('Preview', script.value)
})

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

  > .tabs {
    height: min-content;
  }

  > .tabs-content {
    border: var(--border);
    border-top: 0;
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

