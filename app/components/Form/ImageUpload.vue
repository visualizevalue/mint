<template>
  <div
    class="image-upload"
    :class="{ dragging, loading }"
    @dragover="dragging = true"
    @dragleave="dragging = false"
  >
    <img v-if="preview" :src="previewURL" :alt="preview.name" :title="preview.name">
    <Loading v-if="loading" txt="" />
    <Image v-if="modelValue" :image="modelValue" @loaded="preview = null" version="sm" ref="imageComponent" />
    <label v-if="!modelValue">
      <Icon :type="icon" :stroke-width="2" />
      <span>{{ name }}</span>
      <input
        v-if="! disabled"
        type="file"
        name="image"
        accept="image/png, image/jpg, image/jpeg, image/gif, image/svg+xml, image/webp, video/mp4, video/webm"
        @change.prevent="addFile"
      >
      <FormErrors v-if="errors.length" :errors="errors" />
    </label>
    <button v-if="modelValue && ! disabled" @click="reset" class="reset"><Icon type="x" :stroke-width="3" /></button>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const props = defineProps({
  modelValue: Object,
  name: String,
  icon: {
    type: String,
    default: 'image'
  },
  disabled: Boolean,
})
const emit = defineEmits(['update:modelValue'])

const loading = ref(false)
const dragging = ref(false)
const preview = ref(null)
const previewURL = computed(() => URL.createObjectURL(preview.value))
const imageComponent = ref(null)
const errors = ref([])

const store = async () => {
  if (! preview.value) return

  const formData = new FormData()
  formData.append('attachment', preview.value)

  try {
    loading.value = true

    const image = await $fetch(`${config.public.api}/attachments`, {
      credentials: 'include',
      method: 'POST',
      body: formData,
    })

    emit('update:modelValue', image)
  } catch (e) {
    let message = e.message || `Something went wrong...`

    if (Array.isArray(e.data) && e.data[0]?.message) {
      message = e.data[0]?.message
    }

    alert(message)
  }

  loading.value = false
}

const addFile = (event) => {
  const [file] = event.target.files
  preview.value = file

  store()
}

const reset = () => {
  preview.value = null
  emit('update:modelValue', null)
}
</script>

<style lang="postcss">
  .image-upload {
    container-type: inline-size;
    position: relative;
    min-height: var(--size-9);
    width: 100%;
    height: 100%;
    background: var(--gray-z-0);
    border: var(--border);
    transition: all var(--speed);
    overflow: hidden;
    cursor: pointer;
    aspect-ratio: 1;

    label {
      display: block;
      width: 100cqw;
      height: 100cqw;
      margin: 0;

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--size-2);
      transition: all var(--speed);

      .vue-feather {
        width: var(--size-5);
        height: var(--size-5);
        color: var(--gray-z-6);
      }

      span {
        font-family: var(--font-family-ui);
        text-transform: uppercase;
        font-size: var(--font-xs);
        color: var(--gray-z-7);
        text-align: center;
      }

      input {
        opacity: 0.00001;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
    }

    .loader,
    .image,
    img {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
    }

    img {
      transition: all var(--speed);
      width: 100%;
      aspect-ratio: initial;
      opacity: 0.5;
    }

    .reset {
      position: absolute;
      top: var(--size-3);
      right: var(--size-3);
      width: var(--size-5);
      height: var(--size-5);
      background: transparent;
      color: var(--gray-z-8);
      opacity: 0;
    }

    &:hover .reset {
      opacity: 1;
    }

    &.loading {
      img {
        opacity: 0.5;
      }

      label {
        opacity: 0;
      }
    }

    &.dragging,
    &:--highlight {
      background: var(--gray-z-3);
      border-color: var(--gray-z-5);
    }
  }
</style>
