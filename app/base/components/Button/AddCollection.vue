<template>
  <Button :to="{ name: `id-create`, params: { id } }">
    <Icon type="add" />
    <span>{{ $t('profile.add_collection_button') }}</span>
  </Button>
</template>

<script setup>
defineProps(['id'])
</script>
