# Mint

happy birthday ethereum

## App

### Running the example application in a docker container (1min)

#### Prerequisites

Note for this to work you need to have [Docker](https://www.docker.com) installed on your machine.

#### Build and run the application

Please set your environment variables in an `.env` file in the project root.

```sh
cp .env.example .env
```

Then, start the docker container:

```sh
docker compose up --build
```

This will expose the application on the host machine port specified in the
env file (`:1618` by default).

### Building the application locally (2min)

#### Prerequisites

Note for this you need [Node](https://nodejs.org/en) and
[PNPM](https://pnpm.io/) installed on your machine.

#### Build an run the application

There are two versions of the application available to play with:

- The `base` application - a bare bones app with minimal styling.
- The `example` implementation - a themed version of the application.

Set the application specific `.env` variables in the application.

```sh
cp app/base/.env.example app/base/.env # or in app/example
```

Install the packages:

```bash
pnpm install
```

Build the application for development:

```bash
pnpm --filter @visualizevalue/mint-app-base dev
# ... ➜ Local: http://localhost:1618/
```

Open the locally running app in your browser.

## Themes

The base mint app implementation allows registering themes on top of it,
which extend its functionality and adjust its styling.

You can check out the [Zinc Theme](./app/themes/zinc/) for an example theme implementation.

### Building a custom theme

The `@visualizevalue/mint-app-base` application implements
a bare-bones but feature-complete UI to interact with the Mint contracts.

It is build with [VueJS](https://vuejs.org) on top of [Nuxt](https://nuxt.com).
Nuxt is a quality-of-life batteries included meta-framework on top of VueJS.
It makes [layering new functionality](https://nuxt.com/docs/getting-started/layers)
a breeze.

We can build separate layers as themes to extend the basic styles and features
of the main application.

The `@visualizevalue/mint-theme-zinc` customizes the base application
to implement a custom theme. You can use this as inspiration for your own theme,
or start from scratch by layering on top of the base app directly.

#### Prerequisites

Note for this you need [Node](https://nodejs.org/en) and a package manager
like [NPM](https://www.npmjs.com/), [PNPM](https://pnpm.io/) or [Yarn](https://yarnpkg.com/) installed on your machine.

#### Building a custom theme by adjusting the base theme directly

You can always download fork/download the code for the base application and customize
it directly. This is easy and quick to start but not the preferred way to build
a custom theme since it comes with drawbacks when maintaining a theme over the long term.

#### Building a custom theme by creating a layered Nuxt application

Note this guide only goes through setting up a fresh Mint application
based on the `@visualizevalue/mint-app-base` implementation.
Refer to the [Nuxt Documentation](https://nuxt.com/getting-started) for details
on how to architect Nuxt applications.

##### 1. Create a new Nuxt application

```bash
pnpm dlx nuxi@latest init --template layer <app-name> # and follow the prompts
```

This initializes our layer with a `.playground` application to test the theme.

##### 2. Install the required dependencies

```bash
# Install our base layer application
pnpm add @visualizevalue/mint-app-base --save-peer
```

##### 3. Implement the base layer

In order to start using the base application as our starting point,
we have to add it to the `extends` config option in our nuxt config.
To learn more about it check the `extends` documentation [here](https://nuxt.com/docs/api/nuxt-config#extends).

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

##### 4. Test the application

You can run the application in development mode now!
Run `pnpm dev` to start the app.

##### 5. Adjust some styling

Let's create our own custom styles. Add a `theme.css` file
in a new `assets` folder.

```css
/* Add Pepe styles */
:root {
  --background:   white;
  --color:        black;
  --primary:      red;
  --muted:        blue;

  --border-color: green;
  --border-width: 4px;

  --font-base:    2rem;
  --font-family:  sans-serif;
  --font-weight:  bold;
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
    '@base': '@visualizevalue/mint-app-base/app',
  },

  css: [
    '@base/assets/styles/index.css', // Extend the base theme styles
    join(currentDir, './assets/theme.css'), // Add our own styles
  ],

  // ...
})
```

For further inspiration on building a custom theme, including adding new components
and features check out the `@visualizevalue/mint-app-example` applications
in [/app/example](./app/example/).

### FAQ

#### Can i add WalletConnect to my app?

Yes – just add a `NUXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` environment variable
with your project id.
Create one for your domain at the [WalletConnect cloud](https://cloud.walletconnect.com)

## Contracts
