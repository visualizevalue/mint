<template>
  <article>
    <div class="details">
      <h1>{{ renderer.name }} <small>v{{ renderer.version }}</small></h1>
      <p v-if="renderer.description">{{ renderer.description }}</p>
      <p class="address">{{ renderer.address }}</p>
    </div>
    <slot name="after" />
  </article>
</template>

<script setup>
const { renderer } = defineProps(['renderer'])
</script>

<style scoped>
article {
  display: flex;
  gap: var(--spacer);
  align-items: center;
  justify-content: space-between;
  padding: var(--spacer-sm);

  &:not(:last-child) {
    border-bottom: var(--border);
  }

  .address {
    color: var(--muted);
  }
}
</style>
