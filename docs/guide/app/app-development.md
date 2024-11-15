# Application Development

This chapter will get you set up with the main dev environment and is directed towards developers.

Clone the [Git Repository](https://github.com/visualizevalue/mint) to get started.

## In a Docker container (2min)

### Prerequisites

Note for this to work you need to have [Docker](https://www.docker.com) installed on your machine.

### Build and run the application

Please set your environment variables in an `.env` file in the project root. The example environment
uses the Sepolia testnet deployment of the protocol.

```sh
cp .env.example .env
```

Then, start the docker container:

```sh
docker compose up --build
```

This will expose the application on the host machine port specified in the
env file (`:1618` by default).

## Building the application locally (5min)

### Prerequisites

Note for this you need [Node](https://nodejs.org/en) and
[PNPM](https://pnpm.io/) installed on your machine.

### Build an run the application

There are two versions of the application available to play with:

- The `base` application - a bare bones app with minimal styling.
- The `example` implementation - a themed version of the application.

Set the application specific `.env` variables in the application.

```sh
cp app/base/.env.example app/base/.env
```

Install the packages:

```bash
pnpm install
```

Build and run the application for development:

```bash
pnpm --filter @visualizevalue/mint-app-base dev
```

Open the locally running app in your browser.

You can always download fork/download the code for the base application like above
and customize it directly. While this is easy and quick to start it is **not**
the preferred way to build a custom version of the app since it
comes with drawbacks when maintaining it over the long term.

Let's look at our preferred way to customize Mint applications –
extending the base application in a more reusable fashion in the next chapter
on themes.

