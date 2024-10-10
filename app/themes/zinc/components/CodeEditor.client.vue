<template>
  <BaseCodeEditor
    :model-value="modelValue"
    :placeholder="placeholder"
    @update:modelValue="$emit('update:modelValue', $event)"
    theme="ayu-mirage"
  />
</template>

<script setup>
import { default as BaseCodeEditor } from '@base/components/CodeEditor.client.vue'
import 'codemirror/theme/ayu-mirage.css'

defineProps({
  modelValue: String,
  placeholder: String,
  mode: {
    type: String,
    default: 'text/javascript'
  },
})
defineEmits(['update:modelValue'])
</script>

