<template>
  <article class="mint-preview">
    <Image v-if="image" :src="image" alt="Preview" />
    <ImagePreview v-else />
    <h1 :class="{ '': !name }">{{ name || 'Token' }}</h1>
    <p :class="{ '': !description }">
      {{ description || 'No description' }}
    </p>
  </article>
</template>

<script setup>
const { image, name, description } = useCreateMintData()
</script>

<style scoped>
.mint-preview {
  height: 100%;
  place-content: center;

  .image,
  svg {
    margin-bottom: var(--spacer-sm);
    width: 100%;
  }

  svg {
    box-shadow: var(--border-shadow);
  }

  h1 {
    display: flex;
    gap: var(--spacer-sm);
    align-items: baseline;
    font-size: var(--font-lg);
  }

  p {
    color: var(--muted);
  }
}
</style>

