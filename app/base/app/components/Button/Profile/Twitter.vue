<template>
  <Button v-if="profile.twitter" :to="`https://x.com/${profile.twitter}`">
    <Icon type="twitter" />
    <span>{{ profile.twitter }}</span>
  </Button>
</template>

<script setup>
defineProps(['profile'])
</script>
