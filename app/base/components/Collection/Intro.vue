<template>
  <header class="collection-intro">
    <slot :collection="collection">
      <figure v-if="collection.image">
        <Image :src="collection.image" :alt="collection.name" />
      </figure>
      <div class="text">
        <div>
          <h1>{{ collection.name || 'Unnamed Collection' }} <small v-if="collection.symbol">({{ collection.symbol }})</small></h1>
          <p v-if="collection.description">
            <ExpandableText :text="collection.description" />
          </p>
        </div>

        <div v-if="id">
          <p>
            <span>
              By <NuxtLink :to="{ name: 'id', params: { id } }">{{ store.displayName(id) }}</NuxtLink>
            </span>
            <span>
              {{ collection.latestTokenId }} {{ pluralize('token', Number(collection.latestTokenId)) }}
            </span>
            <span>
              Created at Block {{ collection.initBlock }}
            </span>
          </p>
        </div>

        <CollectionActions :collection="collection" />
      </div>
    </slot>
  </header>
</template>

<script setup lang="ts">
const { collection } = defineProps<{
  collection: Collection
}>()

const id = useArtistId()
const store = useOnchainStore()
</script>

<style scoped>
header.collection-intro {
  display: grid;
  gap: var(--spacer);

  figure {
    max-width: var(--size-10);
  }

  @media (--sm) {
    max-width: 100%;

    &:has(> figure) {
      grid-template-columns: 20% 1fr;
    }
  }

  .text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--spacer);
    position: relative;

    > div {
      display: grid;
      gap: var(--spacer-sm);

      &:nth-child(2) {
        span {
          &:not(:last-child):after {
            content: ' · ';
          }
        }
      }
    }

    h1 {
      font-size: var(--font-lg);

      small {
        color: var(--);
        font-size: var(--font-base);
      }
    }

    menu {
      margin: 0;
      display: flex;
      padding: 0;
      gap: var(--spacer-sm);

      button {
        width: auto;

        @media (--md) {
          width: fit-content;
        }
      }
    }
  }
}
</style>
