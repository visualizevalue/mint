<template>
  <span :class="{ expanded }" v-html="visibleText"></span>
  <slot
    name="trigger"
    v-if="wasShortened"
    :expanded="expanded"
    :toggle="toggle"
  >
    <Button v-if="wasShortened" @click="toggle" class="link inline">
      <Icon :type="expanded ? 'chevron-up' : 'chevron-right'" />
      <span>{{ expanded ? collapseText : expandText }}</span>
    </Button>
  </slot>
</template>

<script setup>
const { length, text } = defineProps({
  length: {
    type: Number,
    default: 120,
  },
  text: String,
  expandText: {
    type: String,
    default: 'Expand',
  },
  collapseText: {
    type: String,
    default: 'Collapse',
  },
})

const cleaned = computed(() => cleanText(text))
const shortened = computed(() => shortenedCleanText(extractURLs(cleaned.value).text, length))
const wasShortened = computed(() => shortened.value !== cleaned.value)
const expanded = ref(false)
const toggle = () => expanded.value = !expanded.value

const visibleText = computed(() => wasShortened.value && !expanded.value ? shortened.value : cleaned.value)
</script>

<style scoped>
span.expanded {
  white-space: pre-wrap;
}

.button {
  margin-top: var(--size-3);
}
</style>
