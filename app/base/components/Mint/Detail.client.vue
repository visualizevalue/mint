<template>
  <div class="mint-detail">
    <MintPreview />

    <MintRendererBase class="card" />

    <MintAction :collection="collection" />
  </div>
</template>

<script setup>
const props = defineProps(['collection'])
</script>

<style>
.mint-detail {
  display: grid;
  gap: var(--spacer);

  > * {
    border: var(--border);
    padding: var(--spacer);
  }

  @media (--md) {
    grid-template-columns: 40% 1fr;
  }

  @media (--lg) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
