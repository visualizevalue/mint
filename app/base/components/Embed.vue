<template>
  <div
    class="embed"
    @touchmove.stop.prevent="() => null"
  >
    <video
      v-if="isPlayable"
      :autoplay="autoplay"
      :loop="loop"
      :muted="muted"
      :controls="controls"
      playsinline
      crossorigin="anonymous"
    >
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

const config = useRuntimeConfig()
const props = defineProps({
  src: String,
  muted: {
    type: Boolean,
    default: true,
  },
  loop: {
    type: Boolean,
    default: true,
  },
  autoplay: {
    type: Boolean,
    default: true,
  },
  controls: {
    type: Boolean,
    default: false,
  },
})

// Update on input change
const src = ref()
const mediaType = ref()
const isPlayable = computed(() => {
  if (! mediaType.value) return false
  return document.createElement('video').canPlayType(mediaType.value) !== ""
})

watchEffect(async () => {
  src.value = validateURI(props.src, config.public)
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
  display: grid;
  align-items: center;
  justify-content: center;
  position: relative;
  touch-action: none;
  overflow: hidden;
  container-type: inline-size;

  video,
  iframe {
    width: 100%;
    width: 100cqw;
    aspect-ratio: 1/1 auto;
  }

  iframe {
    pointer-events: all;
  }
}
</style>

