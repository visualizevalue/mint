import type { RouteLocationRaw } from 'vue-router'

// =====================================================================
// APP-LOGIC
// =====================================================================
export type BreadcrumbItem = string|{
  to: RouteLocationRaw
  text: string
}
export type Breadcrumbs = BreadcrumbItem[]

// =====================================================================
// DATA
// =====================================================================
export interface Artist {
  address: `0x${string}`
  ens?: string|null
  avatar?: string|null
  description?: string|null
  url?: string|null
  email?: string|null
  twitter?: string|null
  github?: string|null
  collections: `0x${string}`[]
  profileUpdatedAtBlock: bigint
}

export interface Collection {
  address: `0x${string}`
  owner: `0x${string}`
  version: bigint,
  image: string
  name: string
  symbol: string
  description: string
  initBlock: bigint
  latestTokenId: bigint
  balance: bigint
  tokens: { [key: string]: Token }
  renderers: Renderer[]
}

export interface Token {
  collection: `0x${string}`
  tokenId: bigint
  name: string
  description: string
  image: string
  animationUrl?: string
  closeAt: bigint
  mintedBlock: bigint
  mintsFetchedUntilBlock: bigint
  mintsBackfilledUntilBlock: bigint
  mints: MintEvent[]
}

export interface MintEvent {
  tokenId: bigint
  address: `0x${string}`
  block: bigint
  logIndex: number
  tx: string
  unitPrice: bigint
  amount: bigint
  price: bigint
}

export interface Renderer {
  address: `0x${string}`
  name: string
  description?: string
  component?: string
  version: bigint
}
