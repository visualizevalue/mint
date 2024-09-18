<template>
  <span>
    {{ display }}
  </span>
</template>

<script setup>
import { useAccount, useEnsName } from '@wagmi/vue'

const props = defineProps(['address'])

const address = computed(() => props.address?.value || props.address)

const { address: currentAddress } = useAccount()
const isCurrent = computed(() => currentAddress.value?.toLowerCase() === address.value.toLowerCase())

const { data: ens } = useEnsName({
  address,
  chainId: 1,
})

const display = computed(() => ens.value || (
  isCurrent.value ? `You` : shortAddress(address.value)
))
</script>
