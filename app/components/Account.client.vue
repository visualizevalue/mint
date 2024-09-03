<template>
  <span>
    {{ display }}
  </span>
</template>

<script setup>
import { useEnsName } from '@wagmi/vue'

const props = defineProps(['address'])

const address = computed(() => props.address?.value || props.address)

const { data: ens } = await useEnsName({
  address,
  chainId: 1,
})

const display = computed(() => ens.value || shortAddress(address.value))
</script>
