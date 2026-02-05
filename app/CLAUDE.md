# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nuxt 3 (Vue 3) frontend for the Visualize Value "Mint" protocol — an ERC-1155 NFT minting platform on Ethereum. Artists deploy collections, create tokens with onchain artifacts, and collectors mint during 24-hour windows at basefee-linked pricing. All data is read directly from the blockchain (no backend API).

## Monorepo Context

This is `app/base` within a pnpm workspace (`pnpm-workspace.yaml` at repo root). Sibling packages:
- `app/themes/*` — Theme variants (e.g. zinc) that extend base
- `app/examples/*` — Example implementations
- `contracts/` — Solidity smart contracts (has its own CLAUDE.md)
- `utils/` — `@visualizevalue/mint-utils` shared TypeScript library
- `indexer/`, `docs/` — Blockchain indexer and documentation site

## Commands

```bash
pnpm install              # Install dependencies (pnpm 10.7.1 required)
pnpm dev                  # Dev server at http://mint.test:1618
pnpm build                # Production build (Nuxt/Nitro, node-cluster preset)
pnpm generate             # Static site generation
pnpm preview              # Preview production build
```

No test or lint commands are configured for this package.

## Architecture

### Web3 Stack

Uses **Wagmi + Viem** (not ethers.js). Wagmi is initialized as a Nuxt plugin (`plugins/2.wagmi.ts`) and provided via `$wagmi`. Chains: mainnet, Sepolia, Holesky, localhost. RPC endpoints are configured via `NUXT_PUBLIC_rpc1/rpc2/rpc3` env vars with fallback transport. Wagmi core functions (`readContract`, `writeContract`, `waitForTransactionReceipt`) and Viem utilities (`isAddress`, `toHex`, `encodeAbiParameters`, etc.) are auto-imported via `nuxt.config.ts` `imports.presets`.

### State Management

Pinia store (`composables/collections.ts`) via `useOnchainStore()` — a factory function returning `defineStore()`. State is persisted to localStorage with custom JSON serialization (handles BigInt). Uses `CURRENT_STATE_VERSION` for cache invalidation — bump this constant to force store reset on next load.

Core state shape: `artists` (by address), `collections` (by address), `tokenBalances` (per user per collection).

### Renderer Plugin System

Renderers are registered per-chain in `app.config.ts` under `knownRenderers`. Each entry maps a contract address to a Vue component name (`Base`, `P5`, `Animation`, `Code`). Renderer UI components live in `components/Mint/Renderer/`. The composable `useCreateMintRendererComponent()` in `composables/createMint.ts` resolves the active renderer to its component.

### Key Data Types

Defined in `utils/types.ts`: `Artist`, `Collection`, `Token`, `MintEvent`, `Renderer`. Collections are ERC-1155 contracts; tokens have 24-hour mint windows, basefee-linked pricing, and onchain artifacts that may be multi-chunk (SSTORE2).

### Routing

File-based Nuxt routing in `pages/`. Key dynamic routes:
- `[id]/` — Artist profile (ENS or address)
- `[id]/[collection]/` — Collection view
- `[id]/[collection]/mint` — Token creation
- `[id]/[collection]/[tokenId]/` — Individual token

Middleware lowercases route params (`middleware/lowercaseId.ts`).

### Component Conventions

- `.client.vue` suffix = client-only (skips SSR hydration). Used for all wallet-connected and Web3 components.
- Plugin ordering is numeric: `1.polyfill.client.ts` → `2.wagmi.ts` → `3.price-feed.client.ts`.
- Composables follow `use*` naming and live in `composables/`.

### Styling

CSS custom properties organized in `assets/styles/variables/`. PostCSS plugins: `postcss-nested`, `postcss-custom-selectors`, `postcss-custom-media`, `postcss-preset-env` (stage 3). Global custom selectors/media defined in `assets/styles/custom-selectors.css` and `custom-media.css` and loaded via `@csstools/postcss-global-data`.

### Environment

See `.env.example`. All public config uses `NUXT_PUBLIC_*` prefix. Key vars: `NUXT_PUBLIC_CHAIN_ID` (1 for mainnet, 11155111 for Sepolia), `NUXT_PUBLIC_CREATOR_ADDRESS` (single-artist mode), `NUXT_SSR` (toggle SSR).

### Contract ABIs

Defined inline in `utils/abis.ts` using Viem's `parseAbi`. Contains ABIs for Mint collections, Factory, and Renderer contracts.
