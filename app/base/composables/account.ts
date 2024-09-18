import { useAccount } from '@wagmi/vue'

export const useIsMeCheck = (checkAddress: Ref|ComputedRef<`0x${string}`>|`0x${string}`|null) => {
  const { address } = useAccount()
  const toCheck = toValue(checkAddress)

  const isMe = ref()

  watchEffect(() => {
    isMe.value = address.value && address.value?.toLowerCase() === toCheck?.toLowerCase()
  })

  return isMe
}

export const useIsMe = () => {
  const id = useArtistId()

  return useIsMeCheck(id.value)
}

