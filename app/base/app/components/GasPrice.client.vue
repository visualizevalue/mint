<template>
  <slot :price="unitPrice">
    <span>{{ unitPrice.formatted.gwei }} GWEI</span>
  </slot>
</template>

<script setup>
const unitPrice = await useGasPrice()
</script>
