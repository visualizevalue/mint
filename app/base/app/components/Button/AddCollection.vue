<template>
  <Button :to="{ name: `id-create`, params: { id } }" class="small">
    Add Collection
  </Button>
</template>

<script setup>
defineProps(['id'])
</script>
