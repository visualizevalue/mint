import { defineNuxtPlugin } from '#app'
import { Buffer } from 'buffer/'

// This also uses the server `polyfill` plugin...
export default defineNuxtPlugin({
  name: 'client-polyfill',
  enforce: 'pre',
  async setup () {
    window.global = window
    window.Buffer = Buffer
  }
})
