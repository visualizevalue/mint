<template>
  <slot :start="start" name="start"></slot>

  <Modal
    :open="open"
    @close="cancel"
    :x-close="false"
    class="transaction-flow"
  >
    <div class="text">
      <CheckSpinner class="spinner" />
      <h1 v-if="text.title[step]">{{ text.title[step] }}</h1>
      <p class="muted-light">{{ text.lead[step] }}</p>
      <p v-if="error">{{ error }}</p>
    </div>

    <slot :name="step" :cancel="cancel"></slot>

    <Button v-if="step === 'waiting'" :to="txLink" target="_blank" class="block-explorer">View on Etherscan</Button>

    <Actions v-if="step === 'confirm' || step === 'error'" class="actions">
      <Button @click="cancel" class="secondary">Cancel</Button>
      <Button @click="() => initializeRequest()">{{ text.action[step] || 'Execute' }}</Button>
    </Actions>
  </Modal>
</template>

<script setup>
import { waitForTransactionReceipt } from '@wagmi/core'
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
  skipConfirmation: Boolean,
  autoCloseSuccess: Boolean,
})

const emit = defineEmits(['complete', 'cancel'])

const open = ref(false)

const switchChain = ref(false)
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

const initializeRequest = async () => {
  if (! await checkChain()) {
    switchChain.value = true
    return
  } else {
    switchChain.value = false
  }

  error.value = ''
  tx.value = null
  receipt.value = null

  if (requesting.value) return

  try {
    requesting.value = true
    tx.value = await props.request()
    requesting.value = false
    waiting.value = true
    const [receipt] = await Promise.all([
      waitForTransactionReceipt($wagmi, { hash: tx.value }),
      delay(6_000),
    ])
    await delay(props.delayAfter)
    receipt.value = receipt
    emit('complete', receipt)
    complete.value = true
  } catch (e) {
    if (e?.cause?.code === 4001) {
      open.value = false
    } else {
      error.value = 'Error submitting transaction request.'
    }
    console.log(e)
    await delay(300) // Animations...
  }

  requesting.value = false
  waiting.value = false

  if (props.autoCloseSuccess) {
    await delay(2_000)
    open.value = false
  }
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
</script>

<style lang="postcss">
.transaction-flow {
  display: grid;
  justify-content: center;
  gap: var(--spacer);

  .spinner {
    width: var(--size-7);
    height: var(--size-7);
    margin: calc(-1 * var(--size-4)) auto var(--size-3);
  }

  h1 {
    font-size: var(--font-lg);
    margin-bottom: var(--size-4);
    text-align: center;
  }

  p {
    white-space: pre-wrap;
    width: 100%;
    text-align: center;

    a {
      text-decoration: underline;
    }
  }

  .block-explorer {
    justify-self: center;
  }
}
</style>
