# Mint Theme: Zinc

A custom layer that adds

- some styling
- customizes a component (`Icon.vue`)
- extends a component (`AppHeader.vue`)
- introduces a new component (`ToggleDarkMode.vue`)

to the base Mint application implementation.

## Usage

You can check out the [@visualizevalue/mint-app-example](../../example/)
implementation to see how this theme is implemented.

Just add the theme to your nuxt config:

```ts
export default defineNuxtConfig({
  extends: [
    '@visualizevalue/mint-theme-zinc',
    '@visualizevalue/mint-app-base',
  ],
  // ...
}
```
