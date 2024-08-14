export default defineNuxtRouteMiddleware((to) => {
  if (to.params.id && typeof to.params.id === 'string') {
    const before = `${to.params.id}`
    to.params.id = to.params.id.toLowerCase()

    if (before !== to.params.id) return navigateTo(to, { redirectCode: 301 })
  }
})
