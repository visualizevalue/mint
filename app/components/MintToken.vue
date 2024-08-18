<template>
  <section>
    <span>{{ displayPrice.value }} {{ displayPrice.format }}</span>

    <FormGroup>
      <FormInput type="number" v-model="mintCount" min="1" required />
      <Button @click="mint">Mint</Button>
    </FormGroup>
  </section>
</template>

<script setup>
import { useAccount } from '@wagmi/vue'

const { $wagmi } = useNuxtApp()
const { address } = await useAccount()

const props = defineProps({
  token: Object,
})
const store = useOnchainStore()

const mintCount = ref('1')
const gasPrice = await useGasPrice()
const price = computed(() => {
  return gasPrice.value.wei * 60_000n * BigInt(mintCount.value)
})
const displayPrice = computed(() => customFormatEther(price.value))

const mint = async () => {
  const hash = await writeContract($wagmi, {
    abi: MINT_ABI,
    chainId: 1337,
    address: props.token.collection,
    functionName: 'mint',
    args: [
      props.token.tokenId,
      BigInt(mintCount.value),
    ],
    value: price.value,
  })

  await waitForTransactionReceipt($wagmi, { chainId: 1337, hash })

  await store.fetchTokenBalance(props.token, address.value)

  mintCount.value = '1'
}
</script>
