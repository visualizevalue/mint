<template>
  <Button :to="{ name: `id-create`, params: { id } }" class="small">
    <Icon type="add"/>
    <span>Collection</span>
  </Button>
</template>

<script setup>
defineProps(['id'])
</script>
