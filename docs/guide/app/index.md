# Base Application

While anyone could build their own entirely novel user interface for the Mint
protocol, we ship a default implementation. This application doesn't rely on any
proprietary APIs and interacts with the Ethereum blockchain via configurable
Node RPC endpoints many of which are open and free to use. This way,
even if one node were to go down, it is easy to switch to a different
RPC node to continue interacting with the protocol.

![The Base Theme](../../assets/base-theme.png)

## Modes

The application has two main modes of deployment:

- **As a SPA (Single Page App)** using static HTML, CSS & JavaScript.
  This is the easiest and cheapest way to deploy the site.
- **As a Node server application**. This is a more involved deployment
  method tailored to developers who want to build more custom experiences
  that require a server environment.

And the application can be configured in two different ways:

- **As a scoped artist application**, which showcases the configured
  artists' work and allows users to mint the artifacts. The artists' collections
  are shown chronologically and each collection is a simple feed of artifacts.
- **As a general purpose application**, which allows anyone to mint and sell their work.
  This deployment mode doesn't have a feed to browse art - artists have to share
  deep-links to their work if they want to use applications like this.

All variants are architected to allow for easy customization and theming.

## Profiles

Profiles are bootstrap from onchain data via [ENS domains](https://ens.domains/).

ENS domains provide a simple way for Ethereum users to attach profile data to their wallets.

We read this data to render profiles with avatars, descriptions, and links to other networks.

If your account looks empty on a Mint app, head over to ENS to fill out your profile.

The beauty of decentralized identity: You set your data once, and it will
be available to all other apps with ENS integrations.

As an example for a filled out ENS profile, check out [brantly.eth](https://app.ens.domains/brantly.eth).

## Examples

- Artist Scoped SPA (Custom Theme): [sepolia.mint.vv.xyz](https://sepolia.mint.vv.xyz)
- Artist Scoped SPA (Zinc Theme): [mint.jalil.cc](https://mint.jalil.cc)
- Artist Scoped SPA (Base Theme): [base.mint.jalil.cc](https://base.mint.jalil.cc)
- General Purpose Node Application (Zinc Theme): [networked.art](https://networked.art)
