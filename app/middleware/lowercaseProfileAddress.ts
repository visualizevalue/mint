export default defineNuxtRouteMiddleware((to) => {
  if (to.params.address && typeof to.params.address === 'string') {
    const before = `${to.params.address}`
    to.params.address = to.params.address.toLowerCase()

    if (before !== to.params.address) return navigateTo(to, { redirectCode: 301 })
  }
})
