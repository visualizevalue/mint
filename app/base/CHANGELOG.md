# @visualizevalue/mint-app-base

## 0.2.0

### Minor Changes

- [`6c1d61c`](https://github.com/visualizevalue/mint/commit/6c1d61c45f802b0721e1a900bdbc5b6512207579) Thanks [@jwahdatehagh](https://github.com/jwahdatehagh)! - Add indexer mode with dapp-query for dual-source data fetching

  - Integrate `@1001-digital/dapp-query` for indexer-first data fetching with automatic RPC fallback
  - Add `NUXT_PUBLIC_INDEXER_ENDPOINTS` configuration for Ponder indexer endpoints
  - Replace hand-rolled fetch logic with `graphqlSource` (indexer) and `customSource` (RPC) per query
  - Collections, tokens, mint events, and artist profiles all fetched via dapp-query with source health tracking, dedup, and idbCache persistence
  - Simplify Pinia store actions to `queryClient.fetch()` calls — removed `dedupe` helper, manual try/catch fallback blocks, and incremental block-range mint fetching
  - Fix token page redirect bug: indexer returning `null` for unindexed collections now correctly falls back to RPC
  - Clean up MintTimeline component: remove backfill machinery (both sources return all mints)
