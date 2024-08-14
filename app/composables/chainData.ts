import type { WatchStopHandle } from 'vue'

let idWatcher: WatchStopHandle|null = null

const id: Ref<`0x${string}`|null> = ref(null)
export const useArtistId = () => {
  const route = useRoute()

  const updateId = () => {
    id.value = (route.params.id as string).toLowerCase() as `0x${string}`
  }
  if (! idWatcher) {
    updateId()
    idWatcher = watch(() => route.params.id, () => updateId())
  }

  return id
}

export const useScopedOnchainData = () => {
  const config = useRuntimeConfig()
  const store = useOnchainStore()
  const id = useArtistId()

  const loading = ref(true)

  const load = async () => {
    loading.value = true
    if (! id.value) return
    await store.fetchArtist(id.value, config.public.factoryAddress as `0x${string}`)
    loading.value = false
  }

  onMounted(() => load())

  return {
    load,
    loading,
  }
}
