<template>
  <slot v-if="initiated && session" />
  <Loading v-else />
</template>

<script setup>
const check = () => {
  if (! initiated.value) return
  if (! session.value) return navigateTo('/login')
  if (! onboardingComplete.value) return navigateTo('/home')
}

onMounted(() => check())
watch(initiated, () => check())
</script>
