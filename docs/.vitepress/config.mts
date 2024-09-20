import { defineConfig } from 'vitepress'
import { getHighlighter, bundledLanguages } from 'shiki'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Mint",
  description: "An opinionated creator owned stack for publishing art to Ethereum.",

  head: [['link', { rel: 'icon', href: '/icon.svg' }]],

  // https://vitepress.dev/reference/default-theme-config
  themeConfig: {
    logo: { src: '/icon.svg', width: 24, height: 24 },

    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Ecosystem', link: '/ecosystem/artists' },
      { text: 'Reference', link: '/reference/' },
    ],

    sidebar: {
      '/': [

      ],
      '/guide/': [
        {
          text: 'Intro',
          items: [
            { text: 'About Mint', link: '/guide/' },
            { text: 'What It Is & Isn\'t', link: '/guide/what-it-is' },
            { text: 'How It Works', link: '/guide/how-it-works' },
          ]
        },
        {
          text: 'Contracts',
          items: [
            { text: 'Overview', link: '/guide/contracts/' },
            { text: 'Factory', link: '/guide/contracts/factory' },
            { text: 'Mint', link: '/guide/contracts/mint' },
            { text: 'Renderers', link: '/guide/contracts/renderers' },
          ]
        },
        {
          text: 'App',
          items: [
            { text: 'Base Application', link: '/guide/app/' },
            { text: 'Run Your Own', link: '/guide/app/run-your-own' },
            { text: 'Extend Base', link: '/guide/app/extend' },
          ]
        },
        {
          text: 'Themes',
          items: [
            { text: 'About Themes', link: '/guide/themes/' },
            { text: 'Build Themes', link: '/guide/themes/build' },
            { text: 'The Zinc Theme', link: '/guide/themes/zinc' },
          ]
        },
        {
          text: 'FAQ',
          link: '/guide/faq/'
        },
        {
          text: 'Ecosystem',
          link: '/ecosystem/artists'
        },
      ],

      '/ecosystem/': [
        {
          text: 'Ecosystem',
          items: [
            // { text: 'A Decentralized Network', link: '/ecosystem/' },
            { text: 'Artist Showcase', link: '/ecosystem/artists' },
            { text: 'Theme Showcase', link: '/ecosystem/themes' },
            { text: 'Known Deployments', link: '/ecosystem/deployments' },
          ],
        },
      ],

      '/reference/': [
        {
          text: 'Base App',
          items: [
            { text: 'Components', link: '/reference/app/components' },
            { text: 'CSS Variables', link: '/reference/app/css' },
          ],
        },
        {
          text: 'Contracts',
          items: [
            { text: 'Create Mint Collection', link: '/reference/contracts/create-collections' },
            { text: 'Read Creator Collections', link: '/reference/contracts/read-creator-collections' },
            { text: 'Create Artifact', link: '/reference/contracts/create-artifacts' },
            { text: 'Read Artifact', link: '/reference/contracts/read-artifacts' },
            { text: 'Purchase Artifacts', link: '/reference/contracts/purchase-artifacts' },
          ],
        },
      ],

    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/visualizevalue/mint' }
    ],

    search: {
      provider: 'local',
    }
  }
})