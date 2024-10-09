<template>
  <article class="mint-preview">
    <div class="static">
      <Image v-if="image" :src="image" :alt="$t('mint.preview.title')" />
      <ImagePreview v-else />
    </div>

    <Embed v-if="animationUrl" :src="animationUrl" />

    <h1 :class="{ '': !name }">{{ name || $t('tokens') }}</h1>
    <p :class="{ '': !description }">
      {{ description || $t('mint.preview.no_description') }}
    </p>
  </article>
</template>

<script setup>
const { image, animationUrl, name, description } = useCreateMintData()
</script>

<style scoped>
.mint-preview {
  height: 100%;
  place-content: center;

  svg {
    box-shadow: var(--border-shadow);
  }

  .image,
  svg {
    margin-bottom: var(--spacer-sm);
    width: 100%;
  }

  .static {
    &:has(+ .embed) {
      width: 30%;
    }
  }

  .embed {
    margin: var(--spacer-sm) 0;
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

