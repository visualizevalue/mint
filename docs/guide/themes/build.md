# How To Build Themes

The `@visualizevalue/mint-app-base` application implements
a bare-bones but feature-complete UI to interact with the Mint contracts.

It is built with [VueJS](https://vuejs.org) on top of [Nuxt](https://nuxt.com).
Nuxt is a quality-of-life batteries included meta-framework on top of VueJS.
It makes [layering new functionality](https://nuxt.com/getting-started/layers)
a breeze.

We can build separate layers as themes to extend the basic styles and features
of the main application.

The `@visualizevalue/mint-theme-zinc` customizes the base application
to implement a custom theme. You can use this as inspiration for your own theme,
or start from scratch by layering on top of the base app directly.

## Prerequisites

Note for this you need [Node](https://nodejs.org/en) and a package manager
like [NPM](https://www.npmjs.com/), [PNPM](https://pnpm.io/) or [Yarn](https://yarnpkg.com/) installed on your machine.

## 1. Create a new Nuxt application

Note this guide only goes through setting up a fresh Mint application
based on the `@visualizevalue/mint-app-base` implementation.
Refer to the [Nuxt Documentation](https://nuxt.com/getting-started) for details
on how to architect Nuxt applications.

```bash
pnpm dlx nuxi@latest init --template layer <app-name>
```

Execute the above command and follow its prompts.
This initializes our layer with a `.playground` folder
containing the application to test the theme.

## 2. Install the required dependencies

Now let's install the base layer

```bash
pnpm add -D @visualizevalue/mint-app-base
```

## 3. Implement the base layer

In order to start using the base application as our starting point,
we have to add it to the `extends` config option in our nuxt config.
To learn more about it check the `extends` documentation [here](https://nuxt.com/api/nuxt-config#extends).

Adjust the `.playground/nuxt.config.ts` file to use both our theme
and the base application layers.

```ts
export default defineNuxtConfig({

  extends: [
    '..', // Extend our theme
    '@visualizevalue/mint-app-base', // Extend the base layer
  ],

})
```

## 4. Test the application

You can run the application in development mode now!
Run `pnpm dev` to start the app.

## 5. Adjust some styling

Let's create our own custom styles. Add a `theme.css` file
in a new `assets` folder.

```css
/* Add Pepe styles */
:root {
  --background: white;
  --color:      black;
  --primary:    red;
  --muted:      blue;

  --border-color: green;
  --border-width: 4px;

  --font-base:      2rem;
  --font-family:    sans-serif;
  --font-weight:    bold;
  --text-transform: uppercase;

  --button-background:           red;
  --button-background-highlight: green;

  --card-background:           red;
  --card-background-highlight: green;
}
```

And let's load the styles in our application.
In the theme's `nuxt.config.ts` file, add:

```ts
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  alias: {
    '@base': '@visualizevalue/mint-app-base',
  },

  css: [
    '@base/assets/styles/index.css', // Extend the base theme styles
    join(currentDir, './assets/theme.css'), // Add our own styles
  ],

  // ...
})
```

For further inspiration on building a custom theme, including adding
new components and features check out the
[`@visualizevalue/mint-theme-zinc`](./zinc) theme.

## Publishing your theme

You can publish your theme on Github or as an NPM package.

Users of the theme are able to easily install it in their applications
via a public Github link or an NPM package.

Make sure to submit a PR to the [Mint Github repository](https://github.com/visualizevalue/mint)
and add your theme to the [showcase gallery](/ecosystem/themes).
