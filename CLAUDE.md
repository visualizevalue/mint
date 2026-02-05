# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mint** is a Visualize Value protocol on Ethereum for artists to deploy ERC-1155 collections, create tokens with onchain artifacts, and sell them during 24-hour mint windows priced at basefee × 60,000 per unit. "To mint is a human right."

## Monorepo Structure

pnpm workspaces (pnpm@10.7.1). All commands run from within their package directory.

| Package | Stack | Purpose |
|---------|-------|---------|
| `app/base` | Nuxt 3, Vue 3, Wagmi/Viem, Pinia | Main frontend application |
| `app/themes/*` | Nuxt layers | Theme variants extending base |
| `app/examples/*` | Nuxt layers | Example implementations |
| `contracts` | Solidity 0.8.24, Hardhat | Smart contracts (see `contracts/CLAUDE.md` for detailed architecture) |
| `indexer` | Ponder, Drizzle, Hono | Onchain event indexer + API |
| `utils` | TypeScript, Viem | Shared utilities (`toByteArray`, `chunkArray`) |
| `docs` | VitePress | Documentation site |

## Commands

### App (`app/base`)
```bash
pnpm dev          # Dev server on port 1618
pnpm build        # Production build
pnpm generate     # Static generation
pnpm preview      # Preview production build
```

### Contracts (`contracts`)
```bash
npx hardhat compile                    # Compile contracts
npx hardhat test                       # Run all tests
npx hardhat test test/Mint.ts          # Run one test file
npx hardhat test --grep "pattern"      # Run tests matching pattern
REPORT_GAS=true npx hardhat test       # Tests with gas reporting
npx hardhat coverage                   # Solidity coverage
npx hardhat size-contracts             # Contract size report
```

### Indexer (`indexer`)
```bash
pnpm dev             # Start indexer dev mode
pnpm start           # Production run
pnpm codegen         # Generate types from schema
pnpm drizzle:push    # Push schema to database
```

### Root
```bash
pnpm install         # Install all workspace dependencies
```

## Architecture

### Frontend (`app/base`)

- **Nuxt 3** with SSR (toggleable via `NUXT_SSR` env var), Nitro preset `node-cluster`
- **Wagmi/Vue + Viem** for wallet connection and contract reads/writes — auto-imported (`readContract`, `writeContract`, `isAddress`, `toHex`, etc.)
- **Pinia** stores with localStorage persistence: `useOnchainStore()` (collections, artists, tokens, balances), `usePriceFeedStore()` (gas prices)
- **TanStack Vue Query** for data fetching
- **PostCSS** with nested CSS, custom-media, custom-selectors, preset-env
- **Routing**: file-based + custom `router.options.ts` for subdomain/artist scope detection
- **i18n** via `@nuxtjs/i18n`, English default, locale files in `locales/`
- **Renderer UI components** in `components/Mint/Renderer/` — one per renderer type (Base, P5, Code, Animation)
- **Known renderer addresses** configured per chain in `app.config.ts`
- Environment configured via `NUXT_PUBLIC_*` vars (see `.env.example`)

### Contracts

Detailed in `contracts/CLAUDE.md`. Key points:
- **Mint.sol**: Core ERC-1155 with SSTORE2 artifact storage, renderer plugin system, 24h mint windows
- **FactoryV1.sol**: UUPS-upgradeable factory with `create()` (full deploy) and `clone()` (EIP-1167 proxy)
- **Renderer plugin system**: `IRenderer` interface (uri, imageURI, animationURI) — Base, P5, P5V2, Animation implementations
- **Tests**: Mocha + Chai + Viem, fixture chain pattern (`baseFixture` → `factoryFixture` → `collectionFixture` → `itemMintedFixture` → `itemPreparedFixture`)
- **Deployment**: Hardhat Ignition with CREATE2 deterministic addresses

### Indexer

- **Ponder** framework: watches Factory `Created` events to discover new Mint contracts, then indexes their events
- **Schema**: accounts, collections, artifacts, ownerships, mints, transfers (defined in `ponder.schema.ts`)
- **API** (Hono): custom endpoints in `src/api/` (e.g., `/api/profiles/:id` with ENS caching)
- **Database**: PostgreSQL via Drizzle ORM

### Shared Utils

`@visualizevalue/mint-utils` — workspace dependency used by both `app/base` and `contracts` for `toByteArray()` and `chunkArray()` (artifact chunking for SSTORE2).

## Environment Setup

Copy `.env.example` to `.env`. Key variables:
- `APP_CHAIN_ID` — Target chain (1 for mainnet, 11155111 for Sepolia)
- `APP_FACTORY_ADDRESS` — Factory contract address for the target chain
- `APP_CREATOR_ADDRESS` — Scopes app to a single artist (optional)
- `APP_RPC1/RPC2/RPC3` — RPC endpoints (multiple for fallback)
- `APP_WALLET_CONNECT_PROJECT_ID` — WalletConnect integration

Docker: `docker compose up` uses `compose.yaml` + `Dockerfile_App`.
