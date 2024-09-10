<template>
  <HeaderBase class="custom-header" />
</template>

<script setup>
import HeaderBase from '@visualizevalue/mint-app-base/app/components/AppHeader'
</script>

<style>
  header.custom-header {
    background: var(--gray-z-1);
    border-color: var(--gray-z-3) !important;
  }

  .lightmode {
    header.custom-header {
      --color: var(--gray-z-9);
      --muted: var(--gray-z-8);
      --muted-light: var(--gray-z-6);

      background: var(--gray-z-4);
    }
  }
</style>

