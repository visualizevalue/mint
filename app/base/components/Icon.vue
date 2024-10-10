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
  'add': '➕',
  'check': '☑️',
  'chevron-down': '⬇️',
  'chevron-right': '➡️',
  'chevron-up': '⬆️',
  'close': '✖️',
  'code': '🩻',
  'discord': '🤖',
  'edit': '📝',
  'email': '📧',
  'folder': '📁',
  'github': '💻',
  'home': '🏠',
  'image': '🏞️',
  'link': '🔗',
  'loader': '⏳',
  'maximize': '⛶',
  'times': '✖️',
  'trash': '🗑️',
  'twitter': '🐦',
  'user': '👤',
  'website': '🌐',
  'withdraw': '💵',
}

const symbol = computed(() => ICONS[props.type])
</script>

<style scoped>
.icon {
  display: inline-flex;
  width: 1em;
  height: 1em;
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>
