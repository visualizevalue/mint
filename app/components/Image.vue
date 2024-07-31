<template>
  <article
    class="image"
    :class="{
      loaded: loaded,
    }"
    :style="{
      padding: `0 0 ${height}`
    }"
    v-intersection-observer="loadImage"
  >
    <iframe v-if="isEmbed" :src="embedURI" frameborder="0" sandbox="allow-scripts"></iframe>
    <video v-else-if="isVideo && !version" :src="uri" playsinline loop autoplay muted ref="video"></video>
    <img
      v-else-if="uri"
      ref="imageEl"
      :alt="`Image ${image.creator ? `by ${image.creator}` : `#${image.id}`}`"
      :src="uri"
      @error="loadOriginal"
      @load="imageLoaded"
    >
  </article>
</template>

<script setup>
import { vIntersectionObserver } from '@vueuse/components'

const props = defineProps({
  image: [String, Object],
  aspectRatio: Number,
  version: String,
  embed: String,
  autoEmbed: {
    type: Boolean,
    default: true,
  },
})
const emit = defineEmits(['loaded'])

const uri = ref('')
const loaded = ref(false)

const isVideo = computed(() => ['mp4', 'webm'].includes(props.image?.type))
const isEmbed = computed(() => false)
const imageEl = ref(null)

/**
 * Aspect Ratio Computation
 */
const aspectRatio = ref(1)
const computeAspectRatio = () => {
  aspectRatio.value = (
    props.aspectRatio || // The passed aspect ratio
    props.image?.aspectRatio || // The image object aspect ratio
    (imageEl.value?.naturalWidth / (imageEl.value?.naturalHeight || 1)) || // The natural image element ratio
    1 // The default square ratio
  )
}
computeAspectRatio()
const height = computed(() => (1 / aspectRatio.value) * 100 + '%')

/**
 * Load the image when we intersect with the viewport
 */
const loadImage = ([{ isIntersecting }]) => {
  if (! isIntersecting) return

  if (! props.image) return

  if (typeof props.image === 'string') {
    uri.value = props.image
    return
  }

  const version = props.image.versions[props.version] ? props.version : ''

  uri.value = imageURI(props.image, version)
}
const loadOriginal = () => {
  uri.value = imageURI(props.image)
}
watch(() => props.image?.uuid, () => loadImage([{ isIntersecting: true }]))

// Image loaded event
const imageLoaded = () => {
  loaded.value = true
  emit('loaded')
  computeAspectRatio()
}
</script>

<style lang="postcss">
article.image {
  overflow: hidden;
  position: relative;
  height: 0;
  padding-bottom: 100%;
  background: var(--gray-z-0);

  &.bordered {
    > * {
      border: var(--border);
    }
  }
  &.rounded {
    border-radius: var(--size-2);

    > * {
      border-radius: var(--size-2);
    }
  }
  &.round {
    border-radius: 50%;

    > * {
      border-radius: 50%;
    }
  }

  video,
  img,
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-fit: contain;
  }

  img {
    transform: scale(1.2);
    width: 100%;
    opacity: 0;
    transition: all var(--speed);
  }

  &.loaded {
    img {
      transform: scale(1);
      opacity: 1;
    }
  }

  &.appear {
    opacity: 0.5;
    transition: all var(--speed-slow);

    img {
      opacity: 0.001;
    }

    &.up {
      transform: translateY(var(--size-6));
    }

    &.loaded {
      opacity: 1;
      transform: translateY(0);

      img {
        opacity: 1;
      }
    }
  }
}
</style>
