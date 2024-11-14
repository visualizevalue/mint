export const useSubdomain = () => useState<string|null>('subdomain', () => null)

export const useArtistScope = () => {
  const subdomain = useSubdomain()
  const creatorAddress = useRuntimeConfig().public.creatorAddress?.toLowerCase()

  return creatorAddress || subdomain.value
}

export const useHideArtistInHeader = () => {
  const isMe = useIsMe()
  const scope = useArtistScope()

  return computed(() => scope || isMe.value)
}

export const useArtistId = () => {
  const route = useRoute()
  const artist = useArtistScope()

  return computed(() => artist
    ? artist as `0x${string}`
    : route.params.id
      ? (route.params.id as string).toLowerCase() as `0x${string}`
      : null
  )
}
