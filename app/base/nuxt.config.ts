import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const currentDir = dirname(fileURLToPath(import.meta.url))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: process.env.NUXT_SSR !== 'false',

  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
  ],

  runtimeConfig: {
    public: {
      blockExplorer: 'https://sepolia.etherscan.io',
      chainId: 1337,
      creatorAddress: '',
      defaultAvatar: '/icons/opepen.svg',
      description: 'To mint is a human right.',
      factoryAddress: '0x0Eb7fB145e697B7e82711BeEFff195F2d7b66cdd',
      platformUrl: 'https://networked.art',
      rpc1: 'https://ethereum-sepolia.rpc.subquery.network/public',
      rpc2: 'https://ethereum-sepolia-rpc.publicnode.com',
      rpc3: 'https://1rpc.io/sepolia',
      title: 'Mint',
      walletConnectProjectId: '',
    }
  },

  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      htmlAttrs: { lang: 'en' },
      title: process.env.NUXT_PUBLIC_TITLE,
      link: [
        { rel: 'icon', href: '/icon.svg', type: 'image/svg+xml' },
      ]
    }
  },

  css: [
    join(currentDir, './assets/styles/index.css'),
  ],

  postcss: {
    plugins: {
      '@csstools/postcss-global-data': {
        files: [
          join(currentDir, './assets/styles/custom-selectors.css'),
          join(currentDir, './assets/styles/custom-media.css'),
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

  // vite: {
  //   optimizeDeps: {
  //     force: true,
  //     include: [
  //       '@wagmi/core > eventemitter3',
  //       'buffer',
  //     ],
  //   },
  // },

  nitro: {
    preset: 'node-cluster',
    esbuild: {
      options: {
        target: 'esnext'
      }
    },
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

  compatibilityDate: '2024-08-14',
})
