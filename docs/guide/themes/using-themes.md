# Using Themes

Using themes in your own apps is very simple.

First make sure you have a base app running. Follow ["Running your own app"](../app/extend)
steps 1 and 2 to get started.

Then install the theme you want to use:

```bash
pnpm add @visualizevalue/mint-theme-zinc
```

And finally add it to your `nuxt.config.ts` on top of the base layer:

```ts
export default defineNuxtConfig({
  extends: [
    '@visualizevalue/mint-theme-zinc',
    '@visualizevalue/mint-app-base',
  ],
})
```
As more themes and plugins are developed, you just replace this config
and should be good to go.
