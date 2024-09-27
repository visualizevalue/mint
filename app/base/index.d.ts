import { Renderer } from './utils/types'

declare module 'nuxt/schema' {
  interface AppConfigInput {
    // Known renderers besides the base renderer
    renderers: Renderer[],
  }
}

// It is always important to ensure you import/export something when augmenting a type
export {}
