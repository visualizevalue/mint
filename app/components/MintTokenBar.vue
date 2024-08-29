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
        (${{ dollarPrice }})
      </Button>
      <TransactionFlow
        :request="mintRequest"
        :text="transactionFlowConfig"
        @complete="onMinted"
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

const { isConnected } = useAccount()

const props = defineProps({
  token: Object,
  displayPrice: Object,
  dollarPrice: String,
  mintRequest: Function,
  transactionFlowConfig: Object,
  minted: Function,
})

const mintCount = defineModel('mintCount', { default: '1' })
const onMinted = () => {
  mintCount.value = '1'
  props.minted()
}

const breakpoints = useBreakpoints()
const showCheck = computed(() => breakpoints.greater('xs').value)
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
