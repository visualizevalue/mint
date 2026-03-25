import { graphqlSource, customSource } from '@1001-digital/dapp-query-core'
import type { QueryDefinition } from '@1001-digital/dapp-query-core'
import type { Config } from '@wagmi/core'
import type { Collection, Token, MintEvent } from '~/utils/types'
import {
  COLLECTIONS_BY_ARTIST, COLLECTION_BY_ADDRESS,
  ARTIFACTS_BY_COLLECTION, MINTS_BY_ARTIFACT,
  transformCollections, transformCollection,
  transformArtifacts, transformMints, transformProfile,
  rpcFetchProfile, rpcFetchCollections,
  rpcFetchCollection, rpcFetchCollectionTokens,
  rpcFetchTokenMints,
} from './sources'

export interface MintQueries {
  artistProfile: QueryDefinition<Partial<Artist>, [`0x${string}`]>
  artistCollections: QueryDefinition<Collection[], [`0x${string}`]>
  collection: QueryDefinition<Collection | null, [`0x${string}`]>
  collectionTokens: QueryDefinition<Token[], [`0x${string}`]>
  tokenMints: QueryDefinition<MintEvent[], [`0x${string}`, bigint]>
}

interface CreateQueriesConfig {
  wagmi: Config
  chainId: number
  factory: `0x${string}`
  endpoints: string[]
}

function makeSources<T> (
  endpoints: string[],
  id: string,
  indexerSource: { source: ReturnType<typeof graphqlSource | typeof customSource> } | null,
  rpcFetch: (...args: unknown[]) => Promise<T>,
) {
  const sources = []

  if (indexerSource) sources.push(indexerSource.source)

  sources.push(customSource<T>({
    id: `${id}-rpc`,
    fetch: rpcFetch,
  }))

  return sources
}

export function createQueries (config: CreateQueriesConfig): MintQueries {
  const { wagmi, chainId, factory, endpoints } = config
  const hasIndexer = endpoints.length > 0

  const indexerProfileSource = hasIndexer
    ? customSource<Partial<Artist>>({
        id: 'profile-indexer',
        fetch: async (address: unknown) => {
          // Multi-endpoint REST failover
          let lastError: Error | undefined
          for (const endpoint of endpoints) {
            try {
              const base = endpoint.replace(/\/$/, '')
              const res = await fetch(`${base}/profiles/${address}`)
              if (!res.ok) throw new Error(`HTTP ${res.status}`)
              return transformProfile(await res.json())
            } catch (e) {
              lastError = e instanceof Error ? e : new Error(String(e))
            }
          }
          throw lastError ?? new Error('All indexer endpoints failed')
        },
      })
    : null

  return {
    artistProfile: {
      key: (address) => `profile:${address}`,
      staleTime: 30 * 60 * 1000, // 30 min
      sources: [
        ...(indexerProfileSource ? [indexerProfileSource] : []),
        customSource<Partial<Artist>>({
          id: 'profile-rpc',
          fetch: (address: unknown) => rpcFetchProfile(wagmi, address as `0x${string}`),
        }),
      ],
    },

    artistCollections: {
      key: (artist) => `collections:${artist}`,
      staleTime: 5 * 60 * 1000,
      sources: [
        ...(hasIndexer ? [graphqlSource<Collection[]>({
          endpoints,
          query: COLLECTIONS_BY_ARTIST,
          variables: (artist: unknown) => ({ artist: (artist as string).toLowerCase() }),
          transform: transformCollections,
        })] : []),
        customSource<Collection[]>({
          id: 'collections-rpc',
          fetch: (artist: unknown) => rpcFetchCollections(wagmi, chainId, artist as `0x${string}`, factory),
        }),
      ],
    },

    collection: {
      key: (address) => `collection:${address}`,
      staleTime: 5 * 60 * 1000,
      sources: [
        ...(hasIndexer ? [graphqlSource<Collection | null>({
          endpoints,
          query: COLLECTION_BY_ADDRESS,
          variables: (address: unknown) => ({ address: (address as string).toLowerCase() }),
          transform: transformCollection,
        })] : []),
        customSource<Collection | null>({
          id: 'collection-rpc',
          fetch: (address: unknown) => rpcFetchCollection(wagmi, chainId, address as `0x${string}`),
        }),
      ],
    },

    collectionTokens: {
      key: (collection) => `tokens:${collection}`,
      staleTime: 5 * 60 * 1000,
      sources: [
        ...(hasIndexer ? [graphqlSource<Token[]>({
          endpoints,
          query: ARTIFACTS_BY_COLLECTION,
          variables: (collection: unknown) => ({ collection: (collection as string).toLowerCase() }),
          transform: transformArtifacts,
        })] : []),
        customSource<Token[]>({
          id: 'tokens-rpc',
          fetch: (collection: unknown) => rpcFetchCollectionTokens(wagmi, chainId, collection as `0x${string}`),
        }),
      ],
    },

    tokenMints: {
      key: (collection, tokenId) => `mints:${collection}:${tokenId}`,
      staleTime: 60 * 1000, // 1 min — mints change frequently during live mint
      sources: [
        ...(hasIndexer ? [graphqlSource<MintEvent[]>({
          endpoints,
          query: MINTS_BY_ARTIFACT,
          variables: (collection: unknown, tokenId: unknown) => ({
            collection: (collection as string).toLowerCase(),
            artifact: String(tokenId),
          }),
          transform: transformMints,
        })] : []),
        customSource<MintEvent[]>({
          id: 'mints-rpc',
          fetch: (collection: unknown, tokenId: unknown) =>
            rpcFetchTokenMints(wagmi, chainId, collection as `0x${string}`, BigInt(tokenId as string | bigint)),
        }),
      ],
    },
  }
}
