# Mint

happy birthday ethereum

## App

### Running the example application in a docker container

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

### Building the application locally

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

### Building a custom theme

As mentioned, the `@visualizevalue/mint-app-base` application implements
a bare-bones but feature-complete UI to interact with the Mint contracts.

It is build with [VueJS](https://vuejs.org) on top of [Nuxt](https://nuxt.com).
Nuxt is a quality-of-life batteries included meta-framework on top of VueJS.
It makes [layering new functionality](https://nuxt.com/docs/getting-started/layers) a breeze.

The `@visualizevalue/mint-app-example` customizes the base application
to implement a custom theme. You can use this as inspiration for your own theme,
or start from scratch but adjusting / layering on top of the base app.

#### Building a custom theme by adjusting the base theme directly

#### Building a custom theme by creating a layered Nuxt application

Note this guide only goes through setting up a fresh Mint application
based on the `@visualizevalue/mint-app-base` implementation.
Refer to the [Nuxt Documentation](https://nuxt.com/getting-started) for details
on how to architect Nuxt applications.

##### 1. Create a new Nuxt application

```bash
pnpm dlx nuxi@latest init <app-name> # and follow the prompts
```

##### 2. Install the required dependencies

```bash
# Install our base layer application
pnpm add @visualizevalue/mint-app-base

# Install required peer dependencies
pnpm add @vue/devtools-api @vueuse/core @vueuse/nuxt eventemitter3
```

##### 3. Implement the base layer

In order to start using the base application as our starting point,
we have to add it to the `extends` config option in our nuxt config.
To learn more about it check the `extends` documentation [here](https://nuxt.com/docs/api/nuxt-config#extends).

Also, to make our build work we have to tell Vite where to find some
package dependencies.

```ts
export default defineNuxtConfig({

  // Extend the base layer
  extends: `@visualizevalue/mint-app-base`,

  // Properly resolve dependencies
  vite: {
    optimizeDeps: {
      include: [
        '@visualizevalue/mint-app-base > buffer',
      ],
    }
  }

  // ...
})
```

Finally, let's remove the default welcome screen and hook up our applications
in the `app.vue` file.

```vue
<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
```

##### 4. Test the application

You can run the application in development mode now! Run `pnpm dev` to start the app.

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

And let's load the styles in our application. In the `app.vue` file, add:

```vue
<template><!-- ... --></template>

<style>
@import "~/assets/theme.css";
</style>
```

For further inspiration on building a custom theme, including adding new components
and features check out the `@visualizevalue/mint-app-example` applications
in [/app/example](./app/example/).

## Contracts

