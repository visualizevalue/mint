import type { RouterConfig } from '@nuxt/schema'

export default {
  routes: (_routes) => {
    const { ssrContext } = useNuxtApp()
    const subdomain = useSubdomain()
    if (ssrContext?.event.context.subdomain) subdomain.value = ssrContext?.event.context.subdomain?.toLowerCase()

    if (subdomain.value) {
      const idRoute = _routes.filter((i) => i.path.includes('/:id'))
      const userRouteMapped = idRoute.map((i) => ({
        ...i,
        path: i.path === '/:id' ? i.path.replace('/:id', '/') : i.path.replace('/:id/', '/'),
      }))

      return userRouteMapped
    }

    return _routes
  },
} satisfies RouterConfig
