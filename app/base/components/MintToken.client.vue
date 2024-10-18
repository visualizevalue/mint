<template>
  <slot
    v-bind="{
      displayPrice,
      dollarPrice: priceFeed.weiToUSD(price),
      mintRequest,
      minted,
      mintOpen,
      currentBlock,
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
          error: 'Mint',
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
const { address } = useAccount()

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
const blocksRemaining = computed(() => props.token.mintedBlock + 7200n - (currentBlock.value || 0n))
const now = useNow()
const until = computed(() => props.token.closeAt)
const secondsRemaining = computed(() => until.value - BigInt(now.value))
const mintOpen = computed(() => secondsRemaining.value > 0)

const mintCount = computed(() => props.mintCount)
const { price, displayPrice } = useMintPrice(mintCount)

const mintRequest = computed(() => async () => {
  const count = BigInt(props.mintCount)

  const priceWithBlockBuffer = price.value * 105n / 100n

  return writeContract($wagmi, {
    abi: MINT_ABI,
    chainId: config.public.chainId,
    address: props.token.collection,
    functionName: 'mint',
    args: [
      props.token.tokenId,
      count,
    ],
    value: priceWithBlockBuffer,
    gas: 80_000n,
  })
})

const minted = async () => {
  await store.fetchTokenBalance(props.token, address.value)

  emit('minted')
}
</script>
