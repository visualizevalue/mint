<template>
  <Button v-if="validateURI(profile.url)" :to="validateURI(profile.url)">
    <Icon type="discord" />
    {{ getMainDomain(profile.url) }}
  </Button>
</template>

<script setup>
defineProps(['profile'])
</script>
