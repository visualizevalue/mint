import { useAccount } from "@wagmi/vue"

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  const { isConnected, address } = useAccount()

  if (to.name === 'index' && isConnected.value) {
    return navigateTo({ name: 'id', params: { id: address.value }})
  }
})
