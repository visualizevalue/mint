<template>
  <button v-if="showConnect" @click="login">
    Connect
  </button>
  <Account v-else :address="account.address" />
</template>

<script setup>
import { computed } from 'vue'
import { useAccount, useConnect } from '@wagmi/vue'
import { injected } from '@wagmi/connectors'

const account = useAccount()
const { connect } = useConnect()

const login = async () => {
  await connect({ connector: injected() })
}

const showConnect = computed(() => !account.isConnected.value)
</script>
