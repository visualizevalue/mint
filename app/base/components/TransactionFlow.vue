<template>
  <slot :start="start" name="start"></slot>

  <Modal
    :open="open"
    @close="cancel"
    :x-close="false"
    class="transaction-flow"
  >
    <slot name="before" />

    <div class="text">
      <h1 v-if="text.title[step]">{{ text.title[step] }}</h1>
      <p v-if="text.lead[step]">{{ text.lead[step] }}</p>
      <p v-if="error">{{ error }}</p>
    </div>

    <slot :name="step" :cancel="cancel"></slot>

    <Button v-if="step === 'waiting'" :to="txLink" target="_blank" class="block-explorer">
      <Icon type="loader" class="spin" />
      <span>{{ $t('transaction_flow.view_on_etherscan') }}</span>
    </Button>

    <Actions v-if="step === 'chain'">
      <Button @click="cancel" class="secondary">{{ $t('transaction_flow.cancel') }}</Button>
    </Actions>

    <Actions v-if="step === 'confirm' || step === 'error'">
      <Button @click="cancel" class="secondary">{{ $t('transaction_flow.cancel') }}</Button>
      <Button @click="() => initializeRequest()">{{ text.action[step] || 'Execute' }}</Button>
    </Actions>
  </Modal>
</template>

<script setup>
import { waitForTransactionReceipt, watchChainId } from '@wagmi/core'
const checkChain = useEnsureChainIdCheck()

const { $wagmi } = useNuxtApp()
const config = useRuntimeConfig()
const props = defineProps({
  text: {
    type: Object,
    default: {
      title: {
        confirm: '[[Really?]]',
      },
      lead: {
        confirm: '[[Do you really?]]'
      },
      action: {
        confirm: '[[Do!]]',
      }
    },
  },
  request: Function,
  delayAfter: {
    type: Number,
    default: 2_000,
  },
  delayAutoclose: {
    type: Number,
    default: 2_000,
  },
  skipConfirmation: Boolean,
  autoCloseSuccess: Boolean,
})

const emit = defineEmits(['complete', 'cancel'])

const open = ref(false)

const switchChain = ref(false)
watchChainId($wagmi, {
  async onChange() {
    if (! switchChain.value) return

    if (await checkChain()) {
      switchChain.value = false
      initializeRequest()
    } else {
      switchChain.value = true
    }
  }
})

const cachedRequest = ref(props.request)
watch(props, () => { cachedRequest.value = props.request })

const requesting = ref(false)
const waiting = ref(false)
const complete = ref(false)
const error = ref('')
const tx = ref(null)
const receipt = ref(null)
const txLink = computed(() => `${config.public.blockExplorer}/tx/${tx.value}`)

const step = computed(() => {
  if (
    open.value &&
    !requesting.value &&
    !switchChain.value &&
    !waiting.value &&
    !complete.value
  ) {
    return 'confirm'
  }

  if (switchChain.value) {
    return 'chain'
  }

  if (requesting.value) {
    return 'requesting'
  }

  if (waiting.value) {
    return 'waiting'
  }

  if (complete.value) {
    return 'complete'
  }

  return 'error'
})

const initializeRequest = async (request = cachedRequest.value) => {
  cachedRequest.value = request
  complete.value = false
  open.value = true
  error.value = ''
  tx.value = null
  receipt.value = null

  if (! await checkChain()) {
    switchChain.value = true
    return
  } else {
    switchChain.value = false
  }

  if (requesting.value) return

  try {
    requesting.value = true
    tx.value = await request()
    requesting.value = false
    waiting.value = true
    const [receiptObject] = await Promise.all([
      waitForTransactionReceipt($wagmi, { hash: tx.value }),
    ])
    await delay(props.delayAfter)
    receipt.value = receiptObject
    emit('complete', receiptObject)
    complete.value = true
  } catch (e) {
    if (e?.cause?.code === 4001) {
      open.value = false
    } else {
      error.value = e.shortMessage || 'Error submitting transaction request.'
    }
    console.log(e)
  }

  requesting.value = false
  waiting.value = false

  if (props.autoCloseSuccess && step.value === 'complete') {
    await delay(props.delayAutoclose)
    open.value = false
    await delay(300) // Animations...
  }

  return receipt.value
}

const start = () => {
  if (props.skipConfirmation && !open.value) {
    initializeRequest()
  }

  open.value = true
}

const cancel = () => {
  open.value = false

  emit('cancel')
}

defineExpose({
  initializeRequest,
})
</script>

<style>
.transaction-flow {
  display: grid;
  gap: var(--spacer);

  .spinner {
    width: var(--size-7);
    height: var(--size-7);
    margin: calc(-1 * var(--size-4)) 0 var(--size-3);
  }

  .text {
    width: 100%;
    height: min-content;
  }

  h1 {
    font-size: var(--font-lg);
    margin-bottom: var(--size-4);
  }

  p {
    white-space: pre-wrap;
    width: 100%;

    a {
      text-decoration: underline;
    }
  }
}
</style>
