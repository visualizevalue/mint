<template>
  <Button v-if="! file" type="button" @click="() => open()">
    <Icon type="image" />
    <span>{{ $t('choose_file') }}</span>
  </Button>
  <FormGroup v-else>
    <Button type="button" disabled>
      <span>{{ shortString(file.name) }}</span>
      <span>({{ formatBytes(file.size) }})</span>
    </Button>
    <Button type="button" class="open" @click="() => open()">
      <Icon type="folder" />
    </Button>
    <Button type="button" class="reset" @click="() => reset()">
      <Icon type="trash" />
    </Button>
  </FormGroup>
</template>

<script setup lang="ts">
import { useFileDialog } from '@vueuse/core'

const props = defineProps({
  accept: {
    type: String,
    default: 'image/*'
  }
})

const emit = defineEmits<{
  change: [file: File|null|undefined]
}>()

const { files, open, reset, onChange } = useFileDialog({
  accept: props.accept,
  multiple: false,
})

const file = computed(() => files.value?.length ? files.value[0] : null)
onChange(() => emit('change', file.value))

defineExpose({
  reset,
})
</script>

<style scoped>
fieldset {
  width: fit-content;
  max-width: -webkit-fill-available;

  .button {
    white-space: nowrap;

    &:first-child {
      span:last-child {
        text-align: right;
      }
    }
  }
}

.button[disabled] {
  color: var(--color);
}

.open,
.reset {
  width: min-content;
}
</style>
