<template>
  <Connect v-if="! isConnected" class="block">Connect To Mint</Connect>
  <FormGroup v-else ref="el">
    <FormInput
      type="number"
      v-model="mintCount"
      @input="userEdited = true"
      min="1"
      step="1"
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
      toast
    >
      <template #start="{ start }">
        <Button @click="start" class="mint">
          Mint
        </Button>
      </template>
    </TransactionFlow>
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
  defaultAmount: { type: Number, default: 1 },
})

const mintCount = defineModel('mintCount', { default: '1' })
const userEdited = ref(false)

watch(() => props.defaultAmount, (v) => {
  if (! userEdited.value) mintCount.value = String(v)
}, { immediate: true })

const onMinted = () => {
  userEdited.value = false
  mintCount.value = String(props.defaultAmount)
  props.minted()
}
</script>

<style scoped>
fieldset {
  container-type: inline-size;

  .amount {
    width: 100%;

    input {
      text-align: center;
    }

    @container (min-width: 30rem) {
      min-width: 6rem;
      width: fit-content;
    }
  }

  .price {
    width: 100%;
    color: var(--color) !important;
  }

  .mint {
    @container (min-width: 30rem) {
      min-width: 9rem;
    }
  }
}
</style>
