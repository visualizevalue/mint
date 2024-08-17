import type { RouteLocationNormalizedGeneric } from 'vue-router'

export const lowercaseRouteParam = (to: RouteLocationNormalizedGeneric, param: string) => {
  if (to.params[param] && typeof to.params[param] === 'string') {
    const before = `${to.params[param]}`
    to.params[param] = to.params[param].toLowerCase()

    if (before !== to.params[param]) return navigateTo(to, { redirectCode: 301 })
  }
}
