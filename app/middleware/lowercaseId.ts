export default defineNuxtRouteMiddleware((to) => lowercaseRouteParam(to, 'id'))
