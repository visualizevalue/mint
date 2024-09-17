<template>
  <DialogFrame class="modal" :class="class" ref="dialog">
    <button v-if="xClose" class="close" @click="$emit('close')">
      <Icon type="close" />
    </button>

    <slot />
  </DialogFrame>
</template>

<script setup>
const props = defineProps({
  open: Boolean,
  class: String,
  xClose: {
    type: Boolean,
    default: true,
  },
})
const emit = defineEmits(['close'])

const dialog = ref()

onMounted(() => {
  if (props.open) dialog.value.open()
})
watch(() => props.open, async () => {
  if (props.open) dialog.value.open()
  else {
    await dialog.value.close()

    // If it's open again (after the animation), open it again...
    if (props.open) dialog.value.open()
  }
})
</script>

