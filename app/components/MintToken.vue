<template>
  <slot
    v-bind="{
      displayPrice,
      dollarPrice: priceFeed.weiToUSD(price),
      mintRequest,
      minted,
      mintOpen,
      blocksRemaining,
      secondsRemaining,
      until,
      transactionFlowConfig: {
        title: {
          chain: 'Switch Chain',
          requesting: 'Confirm In Wallet',
          waiting: 'Transaction Submitted',
          complete: 'Success!'
        },
        lead: {
          chain: 'Requesting to switch chain...',
          requesting: 'Requesting Signature...',
          waiting: 'Checking Mint Transaction...',
          complete: `Token minted...`,
        },
        action: {
          confirm: 'Mint',
          error: 'Retry',
          complete: 'OK',
        },
      },
    }"
  />
</template>

<script setup>
import { useAccount, useBlockNumber } from '@wagmi/vue'

const config = useRuntimeConfig()

const { $wagmi } = useNuxtApp()
const { address } = await useAccount()

const props = defineProps({
  token: Object,
  mintCount: {
    default: 1,
    type: [Number, String],
  },
})
const emit = defineEmits(['minted'])
const store = useOnchainStore()
const priceFeed = usePriceFeedStore()

const { data: currentBlock } = useBlockNumber({ chainId: config.public.chainId })
const mintOpen = computed(() => currentBlock.value && props.token.untilBlock > currentBlock.value)
const blocksRemaining = computed(() => props.token.untilBlock - (currentBlock.value || 0n))
const secondsRemaining = computed(() => blocksToSeconds(blocksRemaining.value))
const until = computed(() => nowInSeconds() + secondsRemaining.value)

const gasPrice = await useGasPrice()
const price = computed(() => gasPrice.value.wei * 60_000n * BigInt(props.mintCount))
const displayPrice = computed(() => customFormatEther(price.value))

const mintRequest = computed(() => async () => {
  return writeContract($wagmi, {
    abi: MINT_ABI,
    chainId: config.public.chainId,
    address: props.token.collection,
    functionName: 'mint',
    args: [
      props.token.tokenId,
      BigInt(props.mintCount),
    ],
    value: price.value,
  })
})

const minted = async () => {
  await store.fetchTokenBalance(props.token, address.value)

  emit('minted')
}
</script>
