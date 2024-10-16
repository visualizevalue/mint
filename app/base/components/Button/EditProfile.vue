<template>
  <Button :to="`https://app.ens.domains/${address}`">
    <Icon type="edit" />
    <span>{{ $t('profile.edit_button') }}</span>
  </Button>
</template>

<script setup>
defineProps(['address'])
</script>
