import { VueQueryPlugin } from '@tanstack/vue-query'
import { WagmiPlugin } from '@wagmi/vue'
import { config } from '../wagmi'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(WagmiPlugin, { config }).use(VueQueryPlugin, {})

  return {
    provide: {
      wagmi: config,
    }
  }
})
