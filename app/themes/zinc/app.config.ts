export default defineAppConfig({
  theme: {
    name: 'Zinc Theme',
  },
})

declare module '@nuxt/schema' {
  interface AppConfigInput {
    theme?: {
      /** Project name */
      name?: string
    }
  }
}
