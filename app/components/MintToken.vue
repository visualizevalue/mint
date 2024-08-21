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
      <Button disabled>
        {{ displayPrice.value }} {{ displayPrice.format }}
        (${{ priceFeed.weiToUSD(price) }})
      </Button>
      <TransactionFlow
        :request="mintRequest"
        :text="{
          title: {
            chain: 'Switch Chain',
            requesting: 'Confirm In Wallet',
            waiting: '2. Transaction Submitted',
            complete: '3. Success!'
          },
          lead: {
            chain: 'Requesting to switch chain...',
            requesting: 'Requesting Signature...',
            waiting: 'Checking Mint Transaction...',
            complete: `New token minted...`,
          },
          action: {
            confirm: 'Mint',
            error: 'Retry',
            complete: 'OK',
          },
        }"
        @complete="minted"
        skip-confirmation
        auto-close-success
      >
        <template #start="{ start }">
          <Button @click="start" class="mint">
            Mint
          </Button>
        </template>
      </TransactionFlow>
    </template>
  </FormGroup>
</template>

<script setup>
import { useAccount } from '@wagmi/vue'

const config = useRuntimeConfig()
const breakpoints = useBreakpoints()

const showCheck = computed(() => breakpoints.greater('xs').value)

const { $wagmi } = useNuxtApp()
const { address, isConnected } = await useAccount()

const props = defineProps({
  token: Object,
})
const emit = defineEmits(['minted'])
const store = useOnchainStore()
const priceFeed = usePriceFeedStore()

const mintCount = ref('1')
const gasPrice = await useGasPrice()
const price = computed(() => gasPrice.value.wei * 60_000n * BigInt(mintCount.value))
const displayPrice = computed(() => customFormatEther(price.value))

const mintRequest = async () => {
  return writeContract($wagmi, {
    abi: MINT_ABI,
    chainId: config.public.chainId,
    address: props.token.collection,
    functionName: 'mint',
    args: [
      props.token.tokenId,
      BigInt(mintCount.value),
    ],
    value: price.value,
  })
}

const minted = async () => {
  await store.fetchTokenBalance(props.token, address.value)

  mintCount.value = '1'

  emit('minted')
}
</script>

<style lang="postcss" scoped>
fieldset {
  .check {
    width: min-content;
  }

  .amount {
    width: 100%;

    input {
      text-align: center;
    }
  }

  @media (--sm) {
    .amount,
    .mint {
      min-width: 8rem;
      width: fit-content;
    }
  }
}
</style>
