<template>
  <Button v-if="profile.email" :to="`mailto:${profile.email}`">
    <Icon type="email" />
    <span>{{ profile.email }}</span>
  </Button>
</template>

<script setup>
defineProps(['profile'])
</script>
