<template>
  <div
    class="embed"
    @touchmove.stop.prevent="() => null"
  >
    <video v-if="isPlayable" autoplay muted playsinline loop crossorigin="anonymous" >
      <source :src="src" :type="mediaType">
      Your browser does not support the video tag.
    </video>
    <iframe
      v-else
      ref="frame"
      frameborder="0"
      :src="src"
      sandbox="allow-scripts"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

async function fetchMediaType(url: string): Promise<string | null> {
  try {
    // Send a HEAD request to get only the headers
    const response = await fetch(url, { method: 'HEAD' })

    // Check if the request was successful
    if (!response.ok) {
      console.error(`Failed to fetch media type. Status: ${response.status}`)
      return null
    }

    // Get the Content-Type header
    const contentType = response.headers.get('Content-Type')

    // Return the media type or null if unavailable
    return contentType ? contentType.split(';')[0] : null
  } catch (error) {
    console.error(`Error fetching media type: ${error}`)
    return null
  }
}

const props = defineProps({
  src: String,
})

// Update on input change
const src = ref(props.src)
const mediaType = ref()
const isPlayable = computed(() => {
  if (! mediaType.value) return false
  return document.createElement('video').canPlayType(mediaType.value) !== ""
})

watchEffect(async () => {
  src.value = props.src
  mediaType.value = await fetchMediaType(src.value)
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

