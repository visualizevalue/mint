<template>
  <div class="mint-renderer-p5">

    <Tabs initial="base">
      <template #menu="{ active, select }">
        <Button @click="select('base')" :class="{ active: active === 'base' }">{{ $t('mint.p5.static') }}</Button>
        <Button @click="select('script')" :class="{ active: active === 'script' }">{{ $t('mint.p5.p5_script') }}</Button>
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
  name,
  description,
} = useCreateMintData()

const script = ref(DEFAULT_P5_SCRIPT)
const update = () => {
  animationUrl.value = getP5HtmlUri(name.value, script.value)
  console.log('update', animationUrl.value)
}
onMounted(() => update())
watch(script, () => update())
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

