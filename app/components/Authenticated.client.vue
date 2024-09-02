<template>
  <slot v-if="isConnected" />
  <Loading v-else />
</template>

<script setup>
import { useAccount } from '@wagmi/vue'

const { isConnected } = useAccount()

const check = () => {
  if (! isConnected.value) return navigateTo('/', { replace: true })
}

onMounted(() => check())
watch(isConnected, () => check())
</script>
