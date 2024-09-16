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

## Contracts
