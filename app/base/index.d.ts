import { Renderer } from './utils/types'

declare module 'nuxt/schema' {
  interface AppConfigInput {
    // Known renderers besides the base renderer
    knownRenderers: {
      1: Renderer[],
      11155111?: Renderer[],
      17000?: Renderer[],
    }
  }
}

// It is always important to ensure you import/export something when augmenting a type
export {}
