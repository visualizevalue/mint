<template>
  <div>
    <span>
      <Account :address="mint.address" />
    </span>

    <span class="right">{{ mint.amount.toString() }}<span class="muted-light">×</span></span>

    <span class="right">{{ formattedPrice.value }} {{ formattedPrice.format }}</span>

    <span class="right"><BlocksTimeAgo :blocks="block - mint.block" /></span>

    <span class="right muted-light">
      <NuxtLink :to="`${config.public.blockExplorer}/tx/${mint.tx}`" target="_blank">
        <Icon type="link" />
      </NuxtLink>
    </span>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()

const props = defineProps({
  mint: Object,
  block: BigInt,
})

const formattedPrice = computed(() => customFormatEther(props.mint.price))
</script>

<style scoped>
</style>
