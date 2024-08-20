<template>
  <FormGroup>
    <Button
      v-if="showCheck"
      class="non-interactive check"
    >
      <Icon type="check" />
    </Button>
    <Connect v-if="! isConnected">Connect To Mint</Connect>
    <template v-else>
      <FormInput
        type="number"
        v-model="mintCount"
        min="1"
        required
        class="amount"
      />
        <!-- prefix="Amount" -->
      <Button disabled>{{ displayPrice.value }} {{ displayPrice.format }}</Button>
      <Button @click="mint">
        Mint
      </Button>
    </template>
  </FormGroup>
</template>

<script setup>
import { useAccount } from '@wagmi/vue'
const breakpoints = useBreakpoints()

const showCheck = computed(() => breakpoints.greater('xs').value)

const { $wagmi } = useNuxtApp()
const { address, isConnected } = await useAccount()

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

<style lang="postcss" scoped>
fieldset {
  .check {
    width: min-content;
  }

  .amount {
    width: 100%;

    @media (--sm) {
      min-width: 8rem;
      width: fit-content;
    }
  }
}
</style>
