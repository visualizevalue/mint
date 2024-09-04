// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  devtools: { enabled: !! process.env.NUXT_DEVTOOLS },
  ssr: process.env.NUXT_SSR !== 'false',

  extends: [
    '../base/',
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

  app: {
    head: {
      title: 'Mint',
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, viewport-fit=cover'
        },
        { name: 'theme-color', content: '#000000' },
        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
      ],
      link: [
        {
          rel: 'icon',
          href: '/icon.svg',
          sizes: 'any',
          type: 'image/svg+xml'
        },
      ]
    }
  },

  css: [
    '~/styles/theme.css',
  ],

  devServer: {
    port: 1618,
    host: process.env.NUXT_PUBLIC_DOMAIN || 'localhost',
  },

  compatibilityDate: '2024-07-29'
})
