<template>
  <article
    class="image"
    :class="{ loaded }"
    @click="$emit('click')"
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

const config = useRuntimeConfig()
const props = defineProps({
  src: String,
  alt: String,
  aspectRatio: Number,
})
const emit = defineEmits(['click', 'loaded'])

const uri = ref('')
const loaded = ref(false)
const imageEl = ref(null)
const height = computed(() => (1 / aspectRatio.value) * 100 + '%')

const loadImage = ([{ isIntersecting }]) => {
  if (! isIntersecting) return

  if (! props.src) return

  uri.value = validateURI(props.src, config.public)
}
watch(() => props.src, () => loadImage([{ isIntersecting: true }]))

// Image loaded event
const imageLoaded = () => {
  loaded.value = true
  emit('loaded')
}
</script>

<style scoped>
article.image {
  background-color: var(--background);
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  container-type: inline-size;
  width: 100%;
  height: 100%;
  max-height: 100cqh;

  .loader {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  img {
    width: auto;
    height: auto;
    max-height: 100cqmin;
    aspect-ratio: 1/1 auto;
    transform: scale(1.2);
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
