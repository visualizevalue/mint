// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: process.env.NUXT_SSR !== 'false',

  extends: [
    // '@visualizevalue/mint-app-base',
    '../base'
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
    '~/assets/styles/theme.css',
  ],

  vite: {
    optimizeDeps: {
      force: true,
      include: [
        '@wagmi/core > eventemitter3'
      ],
    },
  },

  devServer: {
    port: 1618,
    host: process.env.NUXT_PUBLIC_DOMAIN || 'localhost',
  },

  compatibilityDate: '2024-07-29'
})
