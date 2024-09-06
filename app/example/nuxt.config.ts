// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: process.env.NUXT_SSR !== 'false',

  extends: [
    // '@visualizevalue/mint-app-base',
    // '../base'
    '@visualizevalue/mint-app-base',
  ],

  runtimeConfig: {
    public: {
      title: 'Mint',
      description: 'To mint is a human right.',
      blockExplorer: 'https://etherscan.io',
      creatorAddress: '',
      factoryAddress: '',
      chainId: 1337,
      walletConnectProjectId: '',
      platformUrl: 'https://networked.art',
    }
  },

  css: [
    // Doesn't work yet since ordering with layers is wrong.
    // We import the styles in app.vue instead.
    // '~/assets/styles/theme.css',
  ],

  devServer: {
    port: 1618,
    host: process.env.NUXT_PUBLIC_DOMAIN || 'localhost',
  },

  features: {
    inlineStyles: false
  },

  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: '2024-08-14',
})
