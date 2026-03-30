export const useIndexerEndpoints = () => {
  const config = useRuntimeConfig()
  return computed(() => {
    const endpoints = config.public.indexerEndpoints
    return endpoints ? String(endpoints).split(/\s+/).filter(Boolean) : []
  })
}

export const useHasIndexer = () => {
  const endpoints = useIndexerEndpoints()
  return computed(() => endpoints.value.length > 0)
}
