<template>
  <span>{{ unitPrice.formatted.gwei }} GWEI</span>
</template>

<script setup>
const unitPrice = useGasPrice()
</script>
