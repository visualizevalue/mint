<template>
  <article class="collection-overview-card">
    <Image v-if="collection.image" :src="collection.image" :alt="collection.name" />
    <div class="text">
      <div>
        <h1>{{ collection.name }} <small>({{ collection.symbol }})</small></h1>
        <p v-if="collection.description" class="muted-light">{{ shortDescription }}</p>
      </div>

      <div>
        <p>{{ collection.latestTokenId }} {{ pluralize('token', Number(collection.latestTokenId)) }} · Created at Block {{ collection.initBlock }}</p>
      </div>
    </div>
    <CardLink
      :to="{ name: 'id-collection', params: { id: collection.owner, collection: collection.address } }"
      :title="`View ${collection.name}`"
    />
  </article>
</template>

<script setup lang="ts">
const { collection } = defineProps<{
  collection: Collection
}>()

const shortDescription = computed(() => shortString(collection.description, 40, 30))
</script>

<style scoped>
article.collection-overview-card {
  display: grid;
  padding: var(--spacer);
  gap: var(--spacer);
  transition: all var(--speed);
  border: var(--card-border);

  &:has(> a:--highlight) {
    background: var(--gray-z-0);
  }

  @media (--sm) {
    &:has(> .image) {
      grid-template-columns: 20% 1fr;
    }
  }

  img {
    width: 100%;
  }

  .text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--spacer);

    > div {
      display: grid;
      gap: var(--spacer-sm);
    }

    > div:last-child {
      color: var(--muted-light);
    }

    h1 {
      small {
        color: var(--muted-light);
        font-size: var(--font-base);
      }
    }
  }
}
</style>
