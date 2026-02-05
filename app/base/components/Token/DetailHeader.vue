<template>
  <header class="title">
    <slot name="before" />

    <h1>
      {{ token.name }}
      <small>#{{ token.tokenId }}</small>
    </h1>
    <p v-if="token.description">
      <ExpandableText
        :text="token.description"
        :length="95"
        :expand-text="$t('read_more')"
        :collapse-text="$t('collapse')"
      />
    </p>
    <p v-if="collection" class="artist">
      {{ $t('token.by') }}
      <NuxtLink :to="{ name: 'id', params: { id: collection.owner } }">
        {{ store.displayName(collection.owner) }}
      </NuxtLink>
    </p>

    <slot name="after" />
  </header>
</template>

<script setup lang="ts">
const { collection, token } = defineProps<{
  collection: Collection
  token: Token
}>()

const store = useOnchainStore()
</script>

<style scoped>
header {
  display: grid;
  gap: var(--spacer-sm);
  background: var(--card-background);
  backdrop-filter: var(--blur);

  h1 {
    font-size: var(--font-lg);
    overflow-wrap: break-word;

    small {
      color: var(--muted);
    }
  }

  @media (--md) {
    padding: var(--spacer-lg);
  }
}
</style>
