<template>
  <i v-if="ICONS[type]" class="icon">
    {{ symbol }}
  </i>
</template>

<script setup>
const props = defineProps({
  type: String,
})

const ICONS = {
  home: '🜂',
  trash: '✕',
  times: '✕',
  close: '✕',
  folder: '✏',
  edit: '✏',
  check: '✓',
  add: '+',
  image: '+',
  link: '↗︎',
  user: '☻',
  loader: 'ⴵ',
  'chevron-up': '↑',
  'chevron-down': '↓',
  'chevron-right': '→',
  withdraw: 'Ξ',
}

const symbol = computed(() => ICONS[props.type])
</script>

<style scoped>
.icon {
  display: inline-flex;
  width: var(--size-4);
  height: var(--size-4);
  align-items: center;
}
</style>
