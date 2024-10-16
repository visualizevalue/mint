<template>
  <menu v-if="ownedByMe">
    <CollectionWithdraw :collection="collection" />
    <Button
      :to="{ name: 'id-collection-mint', params: { id, collection: collection.address } }"
      id="mint-new"
    >
      <Icon type="add" />
      <span>{{ $t('mint_button') }}</span>
    </Button>
  </menu>
</template>

<script setup>
const { collection } = defineProps({ collection: Object })

const id = useArtistId()
const ownedByMe = useIsMeCheck(collection.owner)
</script>
