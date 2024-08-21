<template>
  <DialogFrame class="modal" ref="dialog">
    <button v-if="xClose" class="close" @click="$emit('close')"><Icon type="x" /></button>

    <slot />
  </DialogFrame>
</template>

<script setup>
const props = defineProps({
  open: Boolean,
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
watch(props, () => {
  if (props.open) dialog.value.open()
  else dialog.value.close()
})
</script>

<style lang="postcss">
</style>
