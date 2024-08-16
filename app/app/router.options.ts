import type { RouterConfig } from '@nuxt/schema'

export default {
  routes: (_routes) => {
    const { ssrContext } = useNuxtApp()
    const subdomain = useSubdomain()

    if (ssrContext?.event.context.subdomain) subdomain.value = ssrContext?.event.context.subdomain?.toLowerCase()

    if (subdomain.value) {
      const normalizedRoutes = _routes
        .map((i) => ({
          ...i,
          path: i.path === '/:id()' ? i.path.replace('/:id()', '/') : i.path.replace('/:id()/', '/'),
        }))
        .filter(r => r.name !== 'index')

      return normalizedRoutes
    }

    return _routes
  },
} satisfies RouterConfig
