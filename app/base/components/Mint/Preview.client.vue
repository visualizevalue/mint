<template>
  <article class="mint-preview">
    <Embed v-if="animationUrl" :src="animationUrl" :muted="false" controls />

    <div class="static">
      <Image v-if="image" :src="image" :alt="$t('mint.preview.title')" />
      <ImagePreview v-else />
    </div>

    <div class="text">
      <h1 :class="{ '': !name }">{{ name || $t('tokens') }}</h1>
      <p :class="{ '': !description }">
        {{ description || $t('mint.preview.no_description') }}
      </p>
    </div>
  </article>
</template>

<script setup>
const { image, animationUrl, name, description } = useCreateMintData()
</script>

<style scoped>
.mint-preview {
  height: min-content;
  place-content: start center;
  border-radius: var(--card-border-radius);
  display: grid;
  grid-template-columns: 20% 1fr;
  gap: var(--spacer);

  @media (--md) {
    position: sticky;
    top: var(--spacer);
  }

  > * {
    grid-column: span 2;
  }

  .embed {
    border-radius: var(--card-border-radius);
    border: var(--border);
  }

  svg {
    box-shadow: var(--border-shadow);
  }

  .image,
  svg {
    border-radius: var(--card-border-radius);
    width: 100%;
  }

  .text {
    height: 100%;
    align-content: center;
  }

  &:has(.embed) {
    > .static {
      grid-column: 1;
    }
    > .text {
      grid-column: 2;
    }
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

