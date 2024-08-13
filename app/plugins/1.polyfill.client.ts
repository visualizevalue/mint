import { defineNuxtPlugin } from '#app'
import buffer from 'buffer'

// This also uses the server `polyfill` plugin...
export default defineNuxtPlugin({
  name: 'client-polyfill',
  enforce: 'pre',
  async setup () {
    window.global = window
    window.Buffer = buffer.Buffer
  }
})
