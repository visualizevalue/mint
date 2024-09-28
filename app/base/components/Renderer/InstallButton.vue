<template>
  <Button @click="install">Install</Button>
  <TransactionFlow
    ref="txFlow"
    :request="installRequest"
    :text="{
      title: {
        chain: 'Switch Chain',
        requesting: 'Confirm In Wallet',
        waiting: 'Transaction Submitted',
        complete: 'Success!'
      },
      lead: {
        chain: 'Requesting to switch chain...',
        requesting: 'Requesting Signature...',
        waiting: 'Checking Transaction...',
        complete: `New Renderer registered...`,
      },
      action: {
        confirm: 'Register Renderer',
        error: 'Retry',
        complete: 'OK',
      },
    }"
    skip-confirmation
    auto-close-success
  />
</template>

<script setup>
const { $wagmi } = useNuxtApp()
const { collection, renderer } = defineProps(['collection', 'renderer'])
const store = useOnchainStore()
const chainId = useMainChainId()

const installRequest = computed(() => async () => {
  return writeContract($wagmi, {
    abi: MINT_ABI,
    chainId,
    address: collection.address,
    functionName: 'registerRenderer',
    args: [
      renderer.address,
    ],
  })
})
const txFlow = ref()
const installing = ref(false)
const install = async () => {
  installing.value = true

  try {
    await txFlow.value.initializeRequest(installRequest.value)

    await store.fetchCollectionRenderers(collection.address)
  } catch (e) {
    console.error(e)
  }

  installing.value = false
}
</script>
