<template>
  <article
    class="image"
    :class="{ loaded }"
    @click="$emit('click')"
    :style="{ padding: `0 0 ${height}` }"
    v-intersection-observer="loadImage"
  >
    <Loading v-if="! loaded" txt=""/>
    <img
      v-if="uri"
      ref="imageEl"
      :alt="alt"
      :src="uri"
      @load="imageLoaded"
    >
  </article>
</template>

<script setup>
import { vIntersectionObserver } from '@vueuse/components'

const props = defineProps({
  src: String,
  alt: String,
  aspectRatio: Number,
})
const emit = defineEmits(['click', 'loaded'])

const uri = ref('')
const loaded = ref(false)
const imageEl = ref(null)
const aspectRatio = ref(1)
const computeAspectRatio = () => {
  aspectRatio.value = (
    props.aspectRatio || // The passed aspect ratio
    (imageEl.value?.naturalWidth / (imageEl.value?.naturalHeight || 1)) || // The natural image element ratio
    1 // The default square ratio
  )
}
computeAspectRatio()
const height = computed(() => (1 / aspectRatio.value) * 100 + '%')

const loadImage = ([{ isIntersecting }]) => {
  if (! isIntersecting) return

  if (! props.src) return

  uri.value = props.src
}
watch(() => props.src, () => loadImage([{ isIntersecting: true }]))

// Image loaded event
const imageLoaded = () => {
  loaded.value = true
  emit('loaded')
  computeAspectRatio()
}
</script>

<style scoped>
article.image {
  overflow: hidden;
  background-color: var(--background);
  overflow: hidden;
  position: relative;
  height: 0;
  padding-bottom: 100%;
  display: flex;

  .loader {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  img {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-fit: contain;
    transform: scale(1.2);
    width: 100%;
    opacity: 0;
    transition: all var(--speed);
    image-rendering: pixelated;
  }

  &:not(.loaded) {
    animation: imageLoading alternate infinite 1s;
  }

  &.loaded {
    img {
      transform: scale(1);
      opacity: 1;
    }
  }
}

@keyframes imageLoading {
  from {
    background-color: var(--background);
  }
  to {
    background-color: var(--muted);
  }
}
</style>
