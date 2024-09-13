<template>
  <Button :to="`https://app.ens.domains/${address}`" class="small">
    <Icon type="edit" />
    <span>Edit Profile</span>
  </Button>
</template>

<script setup>
defineProps(['address'])
</script>
