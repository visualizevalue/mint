<template>
  <Button v-if="profile.twitter" :to="`https://x.com/${profile.twitter}`" class="small">
    <Icon type="twitter" />
    <span>{{ profile.twitter }}</span>
  </Button>
</template>

<script setup>
defineProps(['profile'])
</script>
