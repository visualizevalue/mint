import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const currentDir = dirname(fileURLToPath(import.meta.url))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: process.env.NUXT_SSR !== 'false',

  modules: ['@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt', '@nuxtjs/i18n'],

  runtimeConfig: {
    public: {
      blockExplorer: 'https://etherscan.io',
      chainId: 1,
      creatorAddress: '',
      defaultAvatar: '/icons/opepen.svg',
      description: 'To mint is a human right.',
      factoryAddress: '0xd717Fe677072807057B03705227EC3E3b467b670',
      platformUrl: 'https://networked.art',
      mainnetRpc1: 'https://eth.llamarpc.com',
      rpc1: 'https://eth.llamarpc.com',
      rpc2: 'https://ethereum-rpc.publicnode.com',
      rpc3: 'https://eth.drpc.org',
      ipfsGateway: 'https://ipfs.io/ipfs/',
      arweaveGateway: 'https://arweave.net/',
      mintAmount: 1,
      mintValue: 0,
      title: 'Mint',
      walletConnectProjectId: '',
    },
  },

  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      htmlAttrs: { lang: 'en' },
      title: process.env.NUXT_PUBLIC_TITLE,
      link: [{ rel: 'icon', href: '/icon.svg', type: 'image/svg+xml' }],
    },
  },

  css: [join(currentDir, './assets/styles/index.css')],

  postcss: {
    plugins: {
      '@csstools/postcss-global-data': {
        files: [
          join(currentDir, './assets/styles/custom-selectors.css'),
          join(currentDir, './assets/styles/custom-media.css'),
        ],
      },
      'postcss-nested': {},
      'postcss-custom-selectors': {},
      'postcss-custom-media': {},
      'postcss-preset-env': {
        stage: 3,
        features: {},
      },
      autoprefixer: {},
    },
  },

  hooks: {
    'vite:extendConfig': (config) => {
      config.optimizeDeps ??= {}
      config.optimizeDeps.include = config.optimizeDeps.include || []
      config.optimizeDeps.include.push('@visualizevalue/mint-app-base > eventemitter3')
      config.optimizeDeps.include.push('@visualizevalue/mint-app-base > buffer/')
      config.optimizeDeps.include.push('@visualizevalue/mint-app-base > codemirror')
      config.optimizeDeps.include.push(
        '@visualizevalue/mint-app-base > codemirror-editor-vue3',
      )
    },
  },

  nitro: {
    preset: 'node-cluster',
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },

  imports: {
    presets: [
      {
        from: '@wagmi/core',
        imports: ['readContract', 'waitForTransactionReceipt', 'writeContract'],
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
        ],
      },
    ],
  },

  piniaPersistedstate: {
    storage: 'localStorage',
  },

  i18n: {
    restructureDir: false,
  },

  compatibilityDate: '2024-08-14',
})
