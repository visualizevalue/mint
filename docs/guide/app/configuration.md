# Configuration

The Mint application is configured via environment variables. All public configuration
uses the `NUXT_PUBLIC_` prefix and can be set in a `.env` file in the app directory.

```sh
cp app/base/.env.example app/base/.env
```

## General

| Variable | Default | Description |
|----------|---------|-------------|
| `NUXT_PUBLIC_TITLE` | `Mint` | Application title |
| `NUXT_PUBLIC_DESCRIPTION` | `To mint is a human right.` | Application description |
| `NUXT_PUBLIC_DOMAIN` | `localhost` | Domain for subdomain-based artist scoping |
| `NUXT_SSR` | `true` | Enable/disable server side rendering |
| `NITRO_PRESET` | `node_cluster` | Nitro server preset |

## Chain

| Variable | Default | Description |
|----------|---------|-------------|
| `NUXT_PUBLIC_CHAIN_ID` | `1` | Target chain (`1` for mainnet, `11155111` for Sepolia) |
| `NUXT_PUBLIC_FACTORY_ADDRESS` | | Factory contract address for the target chain |
| `NUXT_PUBLIC_BLOCK_EXPLORER` | `https://etherscan.io` | Block explorer URL |
| `NUXT_PUBLIC_RPC1` | `https://eth.llamarpc.com` | Primary RPC endpoint |
| `NUXT_PUBLIC_RPC2` | | Fallback RPC endpoint |
| `NUXT_PUBLIC_RPC3` | | Fallback RPC endpoint |
| `NUXT_PUBLIC_MAINNET_RPC1` | `https://eth.llamarpc.com` | Mainnet RPC (for ENS resolution on non-mainnet chains) |

## Artist Scope

| Variable | Default | Description |
|----------|---------|-------------|
| `NUXT_PUBLIC_CREATOR_ADDRESS` | | Scope app to a single artist address |

When set, the app only shows the configured artist's collections.
This can also be set via URL subdomains (e.g. `artist.mint.example.com`).

## Mint Defaults {#mint-defaults}

Configure the default mint amount, step size, and target value for the mint input.

| Variable | Query Param | Default | Description |
|----------|-------------|---------|-------------|
| `NUXT_PUBLIC_MINT_AMOUNT` | `?amount=N` | `1` | Default number of tokens to mint |
| `NUXT_PUBLIC_MINT_STEP` | `?step=N` | `1` | Increment/decrement step size |
| `NUXT_PUBLIC_MINT_VALUE` | `?value=N` | `0` (off) | Target USD value for dynamic default amount |

Query parameters take precedence over environment variables.

### Static Default

Set a fixed default mint amount:

```sh
NUXT_PUBLIC_MINT_AMOUNT=10
NUXT_PUBLIC_MINT_STEP=5
```

This sets the mint input to `10` by default, with the up/down arrows adjusting by `5`.

### Dynamic Default (Target USD Value)

Set `MINT_VALUE` to automatically compute how many tokens to mint for a target
dollar amount. The count updates reactively based on the current gas price and
ETH/USD exchange rate (via Chainlink).

```sh
NUXT_PUBLIC_MINT_VALUE=5
```

At a gas price of 10 gwei and ETH at $3,000, this would default to ~3 tokens
(each costing ~$1.80). The amount always floors at 1 token, even if a single
unit exceeds the target value.

When `MINT_VALUE` is set, it takes precedence over `MINT_AMOUNT`.

### Query Parameter Override

All mint defaults can be overridden per-page via query parameters, useful for
sharing links with pre-configured amounts:

```
https://mint.example.com/artist/collection/1?amount=100
https://mint.example.com/artist/collection/1?value=5&step=5
```

## Services

| Variable | Default | Description |
|----------|---------|-------------|
| `NUXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | | WalletConnect project ID |
| `NUXT_PUBLIC_IPFS_GATEWAY` | `https://ipfs.io/ipfs/` | IPFS gateway URL |
| `NUXT_PUBLIC_ARWEAVE_GATEWAY` | `https://arweave.net/` | Arweave gateway URL |
