<template>
  <article>
    <h1>{{ token.name }} #{{ token.tokenId }}</h1>
    <img :src="token.artifact" :alt="token.name">
    <p v-if="token.description">{{ token.description }}</p>
    <Button
      :to="{
        name: 'id-collection-tokenId',
        params: { id: collection.owner, collection: token.collection, tokenId: token.tokenId }
      }"
    >View {{ token.name }}</Button>
  </article>
</template>

<script setup lang="ts">
const { token } = defineProps<{
  token: Token
}>()

const store = useOnchainStore()
const collection = store.collection(token.collection)
</script>

<style lang="postcss" scoped>
section {
  display: grid;
  gap: var(--spacer-lg);
}
</style>
