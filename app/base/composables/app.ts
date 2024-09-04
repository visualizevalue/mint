export const useAppTitle = () => {
  const config = useRuntimeConfig()
  const subdomain = useSubdomain()
  const state = useOnchainStore()

  return computed(() => {
    return subdomain.value
      ? state.ens(subdomain.value as `0x${string}`) || shortAddress(subdomain.value)
      : config.public.title
  })
}

export const useAppBreadcrumb = () => {
  return useState<Breadcrumbs>('breadcrumb', () => [])
}
