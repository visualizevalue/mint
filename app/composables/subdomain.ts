export const useSubdomain = () => useState<string|null>('subdomain', () => null)

export const useArtistScope = () => {
  const subdomain = useSubdomain()
  const creatorAddress = useRuntimeConfig().public.creatorAddress

  return subdomain.value || creatorAddress
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
