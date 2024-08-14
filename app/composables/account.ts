import { useAccount } from '@wagmi/vue'

export const useIsMeCheck = (checkAddress: `0x${string}`) => {
  const { address } = useAccount()

  return computed(() => address.value?.toLowerCase() === checkAddress.toLowerCase())
}

export const useIsMe = () => {
  const id = useArtistId()

  if (! id.value) return computed(() => false)

  return useIsMeCheck(id.value)
}

