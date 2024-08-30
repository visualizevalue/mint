<template>
  <FormGroup ref="el">
    <Connect v-if="! isConnected">Connect To Mint</Connect>
    <template v-else>
      <FormInput
        type="number"
        v-model="mintCount"
        min="1"
        required
        class="amount"
      />
      <Button disabled class="price">
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
</script>

<style lang="postcss" scoped>
fieldset {
  container-type: inline-size;

  .amount {
    width: 100%;

    input {
      text-align: center;
    }

    @container (min-width: 30rem) {
      min-width: 5rem;
      width: min-content;
    }
  }

  .price {
    width: 100%;
  }

  .mint {
    @container (min-width: 30rem) {
      min-width: 8rem;
    }
  }
}
</style>
