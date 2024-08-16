import type { WatchStopHandle } from 'vue'

export const useSubdomain = () => useState<string|null>('subdomain', () => null)

let idWatcher: WatchStopHandle|null = null
const id: Ref<`0x${string}`|null> = ref(null)
export const useArtistId = () => {
  const route = useRoute()
  const subdomain = useSubdomain()

  const updateId = () => {
    id.value = subdomain.value
      ? subdomain.value as `0x${string}`
      : route.params.id
        ? (route.params.id as string).toLowerCase() as `0x${string}`
        : null
  }

  if (! idWatcher) {
    updateId()
    idWatcher = watch(() => route.params.id, () => updateId())
  }

  return id
}
