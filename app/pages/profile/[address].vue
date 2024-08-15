<template>
  <NuxtPage />
</template>

<script setup>
definePageMeta({
  middleware: ['lowercase-profile-address']
})
</script>
