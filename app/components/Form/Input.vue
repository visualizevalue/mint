<template>
  <div class="form-item">
    <span v-if="prefix" class="prefix">{{ prefix }}</span>

    <input
      v-bind="inputAttributes"
      @input="$emit('update:modelValue', $event.target.value)"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      class="input"
    />

    <span v-if="suffix" class="suffix">{{ suffix }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: String,
  type: {
    type: String,
    default: 'text',
  },
  prefix: String,
  suffix: String,
  placeholder: String,
  disabled: Boolean,
  required: Boolean,
  name: String,
  autocomplete: String,
})
const emit = defineEmits(['update:modelValue'])

const inputAttributes = computed(() => ({
  type: props.type,
  value: props.modelValue,
  placeholder: props.placeholder || '',
  disabled: props.disabled || false,
  required: props.required || false,
  required: props.required || false,
  name: props.name || '',
  autocomplete: props.autocomplete || 'on',
}))
</script>
