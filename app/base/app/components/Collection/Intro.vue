<template>
  <header>
    <figure v-if="collection.image">
      <Image :src="collection.image" :alt="collection.name" />
    </figure>
    <div class="text">
      <div>
        <h1>{{ collection.name }} <small>({{ collection.symbol }})</small></h1>
        <p v-if="collection.description" class="muted-light">
          <ExpandableText :text="collection.description" />
        </p>
      </div>

      <div>
        <p v-if="id" class="muted-light">
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

      <menu v-if="ownedByMe">
        <CollectionWithdraw :collection="collection" />
        <Button
          :to="{ name: 'id-collection-mint', params: { id, collection: collection.address } }"
          id="mint-new"
          class="small"
        >Mint New</Button>
      </menu>
    </div>
  </header>
</template>

<script setup lang="ts">
const { collection } = defineProps<{
  collection: Collection
}>()

const id = useArtistId()
const store = useOnchainStore()

const ownedByMe = useIsMeCheck(collection.owner)
</script>

<style scoped>
header {
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
      small {
        color: var(--muted-light);
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
