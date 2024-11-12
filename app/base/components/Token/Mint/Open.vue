<template>
  {{ $t('token.closes_in', { time }) }}
</template>

<script setup>
defineProps({
  time: String,
  blocks: String,
})
</script>
