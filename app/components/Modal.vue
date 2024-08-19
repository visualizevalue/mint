<template>
  <Dialog class="modal" ref="dialog">
    <div class="inner">
      <button class="close" @click="$emit('close')"><Icon type="x" /></button>

      <slot />
    </div>
  </Dialog>
</template>

<script setup>
const props = defineProps({
  open: Boolean,
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
