# Mint

happy birthday ethereum

## Intro

Mint is a simple protocol on Ethereum mainnet, allowing artists to create, manage and sell
their collections easily. It encourages artists to mint immutable artifacts and
offers opinionated standard contract deployment and mint functionality while ensuring
artists and developers can build custom extensions like metadata renderers
on top of the base rails.

Artifacts are priced based on the Ethereum network fees at the time of collecting.

Network fees (Gas fees) are an essential component of of securing
and running decentralized blockchains.

The cost to store and secure the object on the network is mirrored
as compensation to the artist, creating a direct link
between network value and creator reward.

Jump to:

- [App](#app)
- [Contracts](#contracts)
- [FAQ](#faq)

## App

While anyone could build their own entirely novel user interface for the Mint
protocol, we ship a default implementation. This application doesn't rely on any
proprietary APIs and interacts with the Ethereum blockchain via configurable
Node RPC endpoints many of which are open and free to use. This way,
even if one node were to go down, it is easy to switch to a different
RPC node to continue interacting with the protocol.

The application has two main modes of deployment:

- As a SPA (Single Page Application) using static HTML + CSS. 
  This is the easiest and cheapest way to deploy the application.
- As a Node server application. This is a more involved deployment
  method tailored to developers who want to build more custom experiences
  that require a server environment.

And the application can be configured in two different ways:

- As a scoped artist application, which showcases the configured
  artists' work and allows users to mint the artifacts. The artists' collections are shown
  chronologically and each collection is a simple feed of artifacts.
- As a general purpose application, which allows anyone to mint and sell their work.
  This deployment mode doesn't have a feed to browse art - artists have to share 
  deep-links to their work if they want to use applications like this.

It is architected to allow for easy customization via themes.

Check out [base.mint.jalil.cc](https://base.mint.jalil.cc) for an installation of 
the base application (without any customization).

With the initial release, we've built one exemplary custom theme called "Zinc".
For a clean installation of it check out [mint.jalil.cc](https://mint.jalil.cc)
and for a more complex application using it check out [networked.art](https://networked.art).

For an example of a custom theme implementation check out [mint.vv.xyz](https://sepolia.mint.vv.xyz).

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

The [base mint app](./app/base/) implementation allows registering themes on top of it,
which extend its functionality and adjust its styling.

You can check out the [Zinc Theme](./app/themes/zinc/) for an example theme implementation.

| [![The Base Theme](./docs/assets/base-theme.png)](./app/base/)  | [![The Zinc Theme](./docs/assets/zinc-theme.png)](./app/themes/zinc/)  |
| --- | --- |

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
If you want to work on a fork of the base app directly, follow the
[instructions on how to run the base app](#build-an-run-the-application) above.

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
pnpm add -D @visualizevalue/mint-app-base
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

## Contracts

The mint protocol comes with two main contracts that users interact with:
The [`Factory.sol`](./contracts/contracts/factories/FactoryV1.sol) and the [`Mint.sol`](./contracts/contracts/Mint.sol) collections.

Artists create their collections by calling `create` on the Factory contract.

![Factory & Mint](docs/assets/factory-mint.png)

These collections are simple immutable [ERC1155](https://eips.ethereum.org/EIPS/eip-1155)
contracts that allow the artist to mint their art and register
custom renderers for each token.

![Mint & Renderers](docs/assets/mint-create.png)

Each token can define its own renderer contract and/or pass encoded data to it
to e.g. customize the renderer functionality.

The [default renderer](./contracts/contracts/renderers/Renderer.sol) simply takes
the artifact data and encodes it as a blob. But developers have
complete freedom to build custom renderers as they like.

### Factory Deployments

- Mainnet: `0x`
- Sepolia: `0x0Eb7fB145e697B7e82711BeEFff195F2d7b66cdd`

## FAQ

### Are the contracts upgradeable?

The `Factory.sol` contract through which artists can deploy their collections is upgradeable.
When doing so, the `Mint.sol` contract instantiations they create are fully immutable
and owned by the artists themselves. No upgrade can ever affect existing Mint collections.

### Can i add WalletConnect to my app?

Yes – just add a `NUXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` environment variable
with your project id.
Create one for your domain at the [WalletConnect cloud](https://cloud.walletconnect.com)

