import { createVNode, render } from 'vue'
import TransactionToasts from '~/components/TransactionToasts.vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const vnode = createVNode(TransactionToasts)
    vnode.appContext = nuxtApp.vueApp._context
    render(vnode, container)
  })
})
