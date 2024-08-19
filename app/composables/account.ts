import { useAccount } from '@wagmi/vue'

export const useIsMeCheck = (checkAddress: `0x${string}`|null) => {
  const { isConnected, address } = useAccount()

  return computed(() => isConnected.value && address.value?.toLowerCase() === checkAddress?.toLowerCase())
}

export const useIsMe = () => {
  const id = useArtistId()

  return useIsMeCheck(id.value)
}

export const useAccountName = (id: `0x${string}`) => {
  const store = useOnchainStore()
  if (! store.hasArtist) store.fetchArtistProfile(id)

  return computed(() => {
    const artist = store.artist(id)

    return artist?.ens || shortAddress(id)
  })
}
