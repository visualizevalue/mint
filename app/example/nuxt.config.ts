// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  extends: [
    '@visualizevalue/mint-theme-zinc',
    '@visualizevalue/mint-app-base',
  ],

  devServer: {
    port: 1618,
    host: process.env.NUXT_PUBLIC_DOMAIN || 'localhost',
  },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: '2024-08-14',
})
