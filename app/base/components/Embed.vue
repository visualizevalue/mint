<template>
  <div
    class="embed"
    @touchmove.stop.prevent="() => null"
  >
    <iframe
      ref="frame"
      frameborder="0"
      :src="src"
      sandbox="allow-scripts"
    ></iframe>
  </div>
</template>

<script setup>
import { useWindowSize } from '@vueuse/core'

const props = defineProps({
  src: String,
})

// Update on input change
const src = ref(props.src)
watch(props, () => {
  src.value = props.src
})

// Force reload on resize
const { width } = useWindowSize()
watch(width, () => {
  src.value = ''

  nextTick(() => {
    src.value = props.src
  })
})
</script>

<style scoped>
.embed {
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  position: relative;
  touch-action: none;
  overflow: hidden;

  iframe {
    width: 100%;
    height: 100%;
    position: absolute;
    pointer-events: all;
  }
}
</style>

