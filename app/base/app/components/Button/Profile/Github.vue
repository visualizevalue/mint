<template>
  <Button v-if="profile.github" :to="`https://github.com/${profile.github}`" class="small">
    <Icon type="github" />
    <span>{{ profile.github }}</span>
  </Button>
</template>

<script setup>
defineProps(['profile'])
</script>

