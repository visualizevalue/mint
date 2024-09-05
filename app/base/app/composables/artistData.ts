export const useLoadArtistData = (id: `0x${string}`) => {
  const config = useRuntimeConfig()
  const store = useOnchainStore()

  const loading = ref(true)

  const load = async () => {
    loading.value = true
    if (! id) return
    await store.fetchArtistScope(id, config.public.factoryAddress as `0x${string}`)
    loading.value = false
  }

  onMounted(() => load())

  return {
    load,
    loading,
  }
}
