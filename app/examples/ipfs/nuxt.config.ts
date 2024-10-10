// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: [
    '@visualizevalue/mint-theme-zinc',
    '@visualizevalue/mint-app-base',
  ],

   ssr: false,

   app: {
     baseURL: '.',
     head: {
       link: [
         { rel: 'icon', href: './icon.svg', type: 'image/svg+xml' },
       ]
     }
   },

   runtimeConfig: {
     public: {
       defaultAvatar: './icons/opepen.svg',
     }
   },

   router: {
     options: {
       hashMode: true,
     }
   },
})

