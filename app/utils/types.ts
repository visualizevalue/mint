export interface Artist {
  address: `0x${string}`
  ens?: string|null
  avatar?: string|null
  description?: string|null
  collections: `0x${string}`[]
  updatedAtBlock: bigint,
}

export interface Collection {
  address: `0x${string}`
  owner: `0x${string}`
  image: string
  name: string
  symbol: string
  description: string
  initBlock: bigint
  latestTokenId: bigint
  tokens: Token[]
}

export interface Token {
  collection: `0x${string}`
  tokenId: bigint
  name: string
  description: string
  artifact: string
  renderer: bigint
  blocks: bigint
  data: bigint
}
