<template>
  <Button v-if="showConnect" @click="login">
    Connect
  </Button>
  <Account v-else :address="address" />
</template>

<script setup>
import { useAccount, useConnect } from '@wagmi/vue'
import { injected } from '@wagmi/connectors'

const { connect } = useConnect()
const emit = defineEmits(['connected', 'disconnected'])

const { address, isConnected } = useAccount()
const showConnect = computed(() => !isConnected.value)

const login = () => connect({ connector: injected() })

const check = () => isConnected.value ? emit('connected') : emit('disconnected')
watch(isConnected, () => check())
onMounted(() => check())
</script>
