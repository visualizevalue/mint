<template>
  <Button v-if="profile.github" :to="`https://github.com/${profile.github}`">
    <Icon type="github" />
    <span>{{ profile.github }}</span>
  </Button>
</template>

<script setup>
defineProps(['profile'])
</script>

