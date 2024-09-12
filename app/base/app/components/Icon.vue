<template>
  <i v-if="ICONS[type]" class="icon">
    {{ symbol }}
  </i>
  <FeatherIcon v-else :type="type" class="icon" />
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
  loading: 'ⴵ',
  'chevron-up': '↑',
  'chevron-down': '↓',
  'chevron-right': '→',
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
