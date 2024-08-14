import { useAccount } from '@wagmi/vue'

export const useIsMeCheck = (checkAddress: `0x${string}`) => {
  const { address } = useAccount()

  return computed(() => address.value?.toLowerCase() === checkAddress.toLowerCase())
}

export const useIsMe = () => {
  const route = useRoute()

  return useIsMeCheck(route.params.id as `0x${string}`)
}

