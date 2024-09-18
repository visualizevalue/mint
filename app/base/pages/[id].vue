<template>
  <NuxtPage />
</template>

<script setup>
definePageMeta({
  middleware: ['lowercase-id']
})
</script>
