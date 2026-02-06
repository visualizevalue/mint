<template>
  <div class="code-editor">
    <CodeMirror
      ref="cmRef"
      :value="modelValue"
      :options="cmOptions"
      :placeholder="placeholder"
      @change="$emit('update:modelValue', $event)"
      height="100%"
      original-style
    />
  </div>
</template>

<script setup>
import CodeMirror from 'codemirror-editor-vue3'
import 'codemirror/addon/display/placeholder.js'
import 'codemirror/mode/htmlmixed/htmlmixed.js'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/markdown/markdown.js'

const props = defineProps({
  modelValue: String,
  placeholder: String,
  mode: {
    type: String,
    default: 'text/javascript'
  },
  theme: {
    type: String,
    default: 'default'
  },
})
const emit = defineEmits(['update:modelValue'])

const cmOptions = computed(() => ({
  mode: props.mode,
  theme: props.theme,
  indentUnit: 2,
  tabSize: 2,
  indentWithTab: false
}))

const cmRef = ref()

defineExpose({
  cmRef,
})
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
