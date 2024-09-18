<template>
  <div v-if="errors.length" class="errors">
    <p v-for="error in errors">{{ error.message }}</p>
  </div>
</template>

<script setup>
defineProps({
  errors: Array,
})
</script>

<style scoped>
.errors {
  padding: var(--spacer) 0;
  color: var(--error);
}
</style>
