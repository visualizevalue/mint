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
      { text: 'Guide', link: '/' },
      { text: 'Reference', link: '/reference/' },
      { text: 'Networked.Art', link: 'https://networked.art' },
    ],

    sidebar: [
      {
        text: 'Intro',
        items: [
          { text: 'About Mint', link: '/' },
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
          { text: 'App Intro', link: '/guide/app/' },
          { text: 'Base Implementation', link: '/guide/app/base' },
          { text: 'Run Your Own', link: '/guide/app/run-your-own' },
          { text: 'Extend Base', link: '/guide/app/extend' },
        ]
      },
      {
        text: 'Themes',
        items: [
          { text: 'About Themes', link: '/guide/themes' },
          { text: 'Build Themes', link: '/guide/themes/build' },
        ]
      },
      {
        text: 'Ecosystem',
        items: [
          { text: 'A Decentralized Network', link: '/ecosystem/' },
          { text: 'Artist Showcase', link: '/ecosystem/artists' },
          { text: 'Theme Showcase', link: '/ecosystem/themes' },
          { text: 'Known Instances', link: '/ecosystem' },
          { text: 'FAQ', link: '/faq' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/visualizevalue/mint' }
    ],

    search: {
      provider: 'local',
    }
  }
})
