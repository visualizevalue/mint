import { waitForTransactionReceipt } from '@wagmi/core'
import type { TransactionReceipt } from 'viem'

export interface TrackedTransaction {
  hash: string
  status: 'waiting' | 'complete' | 'error'
  waitingText: string
  completeText: string
  txLink: string
}

export const useTransactionStore = defineStore('transactions', () => {
  const { $wagmi } = useNuxtApp()
  const config = useRuntimeConfig()

  const pending = ref<TrackedTransaction[]>([])

  const track = (
    hash: string,
    waitingText: string,
    completeText: string,
    onComplete?: (receipt: TransactionReceipt) => void,
  ) => {
    const entry: TrackedTransaction = reactive({
      hash,
      status: 'waiting',
      waitingText,
      completeText,
      txLink: `${config.public.blockExplorer}/tx/${hash}`,
    })

    pending.value.push(entry)

    waitForTransactionReceipt($wagmi, { hash: hash as `0x${string}` })
      .then((receipt) => {
        entry.status = 'complete'
        onComplete?.(receipt)
        setTimeout(() => remove(hash), 4000)
      })
      .catch(() => {
        entry.status = 'error'
        setTimeout(() => remove(hash), 8000)
      })
  }

  const remove = (hash: string) => {
    pending.value = pending.value.filter((t) => t.hash !== hash)
  }

  return { pending, track, remove }
})
