import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const currentDir = dirname(fileURLToPath(import.meta.url))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: {
    '@base': '@visualizevalue/mint-app-base/app',
  },

  css: [
    '@base/assets/styles/index.css',
    join(currentDir, './assets/theme.css'),
  ],

  future: {
    compatibilityVersion: 4,
  },
})

