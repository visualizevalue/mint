export const useSubdomain = () => useState<string|null>('subdomain', () => null)

export const useArtistId = () => {
  const route = useRoute()
  const subdomain = useSubdomain()

  return computed(() => subdomain.value
    ? subdomain.value as `0x${string}`
    : route.params.id
      ? (route.params.id as string).toLowerCase() as `0x${string}`
      : null
  )
}
