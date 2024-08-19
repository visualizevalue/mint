// https://nuxt.com/docs/api/configuration/nuxt-config

console.log('nuxt WALLET_CONNECT_PROJECT_ID', process.env.WALLET_CONNECT_PROJECT_ID)

export default defineNuxtConfig({
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      title: 'Mint',
      description: 'To mint is a human right.',
      creatorAddress: '',
      factoryAddress: '',
      walletConnectProjectId: '',
    }
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
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
        {
          name: 'twitter:site',
          content: '@evverydays',
        }
      ],
      link: [
        {
          rel: 'icon',
          href: '/favicon.ico',
          sizes: '48x48'
        },
        {
          rel: 'icon',
          href: '/icon.svg',
          sizes: 'any',
          type: 'image/svg+xml'
        },
        {
          rel: 'apple-touch-icon',
          href: '/apple-touch-icon-512x512.png'
        },
      ]
    }
  },

  css: [
    '~/styles/index.css',
  ],

  postcss: {
    plugins: {
      '@csstools/postcss-global-data': {
        files: [
          'styles/custom-selectors.css',
          'styles/custom-media.css',
        ]
      },
      'postcss-nested': {},
      'postcss-custom-selectors': {},
      'postcss-custom-media': {},
      'postcss-preset-env': {
        stage: 3,
        features: {},
      },
      'autoprefixer': {},
    },
  },

  modules: [
    '@wagmi/vue/nuxt',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
  ],

  devServer: {
    port: 1618,
    host: process.env.NUXT_PUBLIC_DOMAIN || 'localhost',
  },

  vite: {
    optimizeDeps: {
      include: ['eventemitter3'],
    },
  },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
    }
  },

  imports: {
    presets: [
      {
        from: '@wagmi/core',
        imports: [
          'readContract',
          'waitForTransactionReceipt',
          'writeContract',
        ]
      },
      {
        from: 'viem',
        imports: [
          'decodeEventLog',
          'isAddress',
          'getAddress',
          'toBytes',
          'toHex',
          'getContract',
          'encodeAbiParameters',
          'parseAbiParameters',
          'parseAbiParameter',
        ]
      }
    ]
  },

  piniaPersistedstate: {
    storage: 'localStorage'
  },

  compatibilityDate: '2024-07-29'
})
