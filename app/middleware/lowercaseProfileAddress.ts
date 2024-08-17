export default defineNuxtRouteMiddleware((to) => lowercaseRouteParam(to, 'address'))
