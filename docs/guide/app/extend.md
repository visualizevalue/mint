# Extending The Base Application

The suggested way of building your custom version of the application is to
set up your own Nuxt application and extend the base layer. This ensures
you can easily patch future updates to the base application.

Let's do this now!

## 1. Create a new Nuxt application

In your terminal, navigate to the folder you want to initialize
the project in, and run the following command:

```bash
pnpm dlx nuxi@latest init <app-name>
```

Once done, you can run your local Nuxt app like so:

```bash
pnpm dev
```

## 2. Extend the base application

First we need to install the base Mint application.

```bash
pnpm add -D @visualizevalue/mint-app-base
```

In order to start using the base application as our starting point,
we have to add it to the `extends` config option in our nuxt config.
To learn more about it check the `extends` documentation [here](https://nuxt.com/api/nuxt-config#extends).

Adjust the `nuxt.config.ts` file to the base application layer.
You can use your favorite text editor for this. If you don't
have one, [VS Code](https://code.visualstudio.com/download) is a common choice.

```ts
export default defineNuxtConfig({

  extends: '@visualizevalue/mint-app-base',

})
```

To hook up our base application, let's delete the default `app.vue` file:

```bash
rm app.vue
```

Run the application in development mode now!
Execute `pnpm dev` in your terminal to start/restart the app.

You'll realize that if you connect to the site with different wallets,
that you can use the app from all of these wallets. Let's remove that functionality
and scope the site to just one creator.

Copy the [example environment file](https://github.com/visualizevalue/mint/blob/main/app/base/.env.example) or create a new `.env`
file in your app.

Now edit the environment file in your text editor and configure your
creator wallet address:

```yaml
# Change this address to yours
NUXT_PUBLIC_CREATOR_ADDRESS=0xc8f8e2F59Dd95fF67c3d39109ecA2e2A017D4c8a
```

Restart your development server by running `pnpm dev` and
open the application in your browser. You'll see that this new
version will always show your creator address, regardless with
which account you're logged in. Also, it will only allow you (the creator)
to deploy new collections or to mint new tokens.

## 3. Adjust some styling

> [!TIP]
> If you want to use a theme instead of applying your own styles,
> check out [how to use themes](../themes/using-themes).

Let's create our own custom styles. Add a `styles.css` file
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
export default defineNuxtConfig({
  alias: {
    '@base': '@visualizevalue/mint-app-base',
  },

  css: [
    '@base/assets/styles/index.css', // Extend the base theme styles
    '~/assets/styles.css', // Add our own styles
  ],

  // ...
})
```

Congratulations, you now built your own Mint application.
There is a lot to explore – you can adjust anything you like,
add or remove functionality to your liking. Why not link your
other collections on the landing page?

## 4. Generate production code and deploy your application

There are two ways of running the application: On a node server
or as a static website running purely in the browser.

For most applications, the static hosting variant will be sufficient.

For this, set `ssr: false` in your `nuxt.config.ts` or set your
`NUXT_SSR` environment variable to `false`.

In order to generate the application code, run

```bash
pnpm run generate
```

This builds the static assets into the `.output` directory.
You can host these files on any static file server you like
and it should just work.

> [!TIP]
> For more info on deployment options, check out the [Nuxt documentation](https://nuxt.com/docs/getting-started/deployment).

While building your custom theme like this is great, what if we want to
share our theme with others for them to use it as well?
This is exactly what Mint Themes are for. They enable other users to quickly
install and try out different themes while still allowing them to
customize their application further.

Let's learn about Themes next...
