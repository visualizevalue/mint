import { useAccount } from '@wagmi/vue'

export const useIsMeCheck = (checkAddress: `0x${string}`|null) => {
  const { isConnected, address } = useAccount()

  return computed(() => isConnected.value && address.value?.toLowerCase() === checkAddress?.toLowerCase())
}

export const useIsMe = () => {
  const id = useArtistId()

  return useIsMeCheck(id.value)
}
