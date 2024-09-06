<template>
  <div>
    <h1 class="display">{{ error?.statusCode }}</h1>
    <p class="lead">{{ error?.message }}</p>
    <Button to="/">Go back home</Button>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps({
  error: Object as () => NuxtError
})
</script>

<style scoped>
div {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacer);
  height: 100dvh;

  .button {
    display: flex;
    margin-top: var(--size-6);
  }
}
</style>
