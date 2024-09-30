<template>
  <div class="code-editor">
    <CodeMirror
      :value="modelValue"
      :options="cmOptions"
      height="100%"
      :placeholder="placeholder"
      @change="$emit('update:modelValue', $event)"
      original-style
    />
  </div>
</template>

<script setup>
import CodeMirror from 'codemirror-editor-vue3'
import 'codemirror/addon/display/placeholder.js'
import 'codemirror/mode/htmlmixed/htmlmixed.js'
import 'codemirror/mode/javascript/javascript.js'
// import 'codemirror/theme/ayu-mirage.css'

const props = defineProps({
  modelValue: String,
  placeholder: String,
  mode: {
    type: String,
    default: 'text/javascript'
  },
})
const emit = defineEmits(['update:modelValue'])

const cmOptions = computed(() => ({
  mode: props.mode,
  // theme: 'ayu-mirage',
  indentUnit: 2,
  tabSize: 2,
  indentWithTab: false
}))
</script>

<style scoped>
.code-editor {
  text-transform: none;
  height: 100%;

  :deep(.CodeMirror) {
    height: 100%;
  }
}
</style>
