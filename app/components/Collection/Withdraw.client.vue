<template>
  <TransactionFlow v-if="collection.balance" :request="withdraw" :text="{
    title: {
      chain: 'Switch Chain',
      requesting: 'Confirm In Wallet',
      waiting: 'Transaction Submitted',
      complete: 'Success!'
    },
    lead: {
      chain: 'Requesting to switch chain...',
      requesting: 'Requesting Signature...',
      waiting: 'Checking withdraw transaction...',
      complete: `Contract balance withdrawn...`,
    },
    action: {
      confirm: 'Withdraw',
      error: 'Retry',
      complete: 'OK',
    },
  }" skip-confirmation auto-close-success @complete="onComplete">
    <template #start="{ start }">
      <Button @click="start" class="small">
        Withdraw ({{ balance.value }} {{ balance.format }})
      </Button>
    </template>
  </TransactionFlow>
</template>

<script setup>
const { $wagmi } = useNuxtApp()
const chainId = useMainChainId()

const { collection } = defineProps({
  collection: Object,
})

const balance = computed(() => customFormatEther(collection.balance))

const withdraw = computed(() => async () => {
  return await writeContract($wagmi, {
    abi: MINT_ABI,
    chainId,
    address: collection.address,
    functionName: 'withdraw',
  })
})

const store = useOnchainStore()
const onComplete = async () => {
  await store.fetchCollectionBalance(collection.address)
}

onMounted(async () => {
  await store.fetchCollectionBalance(collection.address)
})
</script>
