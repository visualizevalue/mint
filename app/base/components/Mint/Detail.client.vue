<script setup>
import Base from './Renderer/Base.client.vue'
import P5 from './Renderer/P5.client.vue'

const components = {
  Base,
  P5,
}

const props = defineProps(['collection'])
const { component } = useCreateMintRendererComponent(props.collection)
</script>

<template>
  <div class="mint-detail">
    <Actions class="borderless">
      <MintSelectRenderer :collection="collection" />
      <MintAction :collection="collection" />
    </Actions>

    <MintPreview />

    <component :is="components[component]" class="card" />
  </div>
</template>

<style>
.mint-detail {
  display: grid;
  gap: var(--spacer);

  > *:not(.borderless) {
    border: var(--border);
    padding: var(--spacer);
  }

  > menu {
    justify-content: space-between;
  }

  @media (--md) {
    grid-template-columns: 40% 1fr;

    > menu,
    .mint-select-renderer {
      grid-column: span 2;
    }
  }

  @media (--lg) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

