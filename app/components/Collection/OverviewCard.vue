<template>
  <article>
    <img v-if="collection.image" :src="collection.image" :alt="collection.name">
    <div class="text">
      <div>
        <h1>{{ collection.name }} <small>({{ collection.symbol }})</small></h1>
        <p v-if="collection.description" class="muted-light">
          <ExpandableText :text="collection.description" />
        </p>
      </div>

      <div>
        <p>{{ collection.latestTokenId }} Tokens · Created at Block {{ collection.initBlock }}</p>
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
</script>

<style lang="postcss" scoped>
article {
  display: grid;
  padding: var(--spacer);
  gap: var(--spacer);
  border: var(--border);
  background: var(--background);
  transition: all var(--speed);

  &:has(> a:--highlight) {
    background: var(--gray-z-0);
  }

  @media (--sm) {
    grid-template-columns: 20% 80%;
  }

  img {
    width: 100%;
    border: var(--border);
    border-radius: var(--border-radius);
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
