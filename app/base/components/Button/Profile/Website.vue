<template>
  <Button v-if="validateURI(profile.url)" :to="validateURI(profile.url)">
    <Icon type="website" />
    <span>{{ getMainDomain(profile.url) }}</span>
  </Button>
</template>

<script setup>
defineProps(['profile'])
</script>
