<template>
  <Button :to="`https://app.ens.domains/${address}`" class="small">
    Edit Profile
  </Button>
</template>

<script setup>
defineProps(['address'])
</script>
