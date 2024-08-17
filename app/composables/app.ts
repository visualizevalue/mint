export const useAppTitle = () => {
  const config = useRuntimeConfig()
  const subdomain = useSubdomain()
  const state = useOnchainStore()

  return computed(() => subdomain.value
    ? state.artist(subdomain.value as `0x${string}`)?.ens || subdomain.value
    : config.public.title
  )
}


export const useAppBreadcrumb = () => {
  return useState<Breadcrumbs>('breadcrumb', () => [])
}
