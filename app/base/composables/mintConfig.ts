export const useMintConfig = () => {
  const route = useRoute()
  const config = useRuntimeConfig()

  // Query param > ENV > default
  const amount = computed(() => Number(route.query.amount) || Number(config.public.mintAmount) || 1)
  const value = computed(() => Number(route.query.value) || Number(config.public.mintValue) || 0)

  return { amount, value }
}
