<template>
  <PageFrame>
    <header>
      <Connect v-if="! isConnected" />
    </header>
  </PageFrame>
</template>

<script setup>
import { useAccount } from '@wagmi/vue'

const { address, isConnected } = useAccount()

const redirect = () => {
  if (isConnected) navigateTo({ name: 'profile-address', params: { address: address.value?.toLowerCase() }}, {
    replace: true
  })
}
onMounted(() => redirect())
watch(isConnected, () => redirect())

useMetaData({
  title: `Profile`,
})
</script>

<style scoped>
</style>
