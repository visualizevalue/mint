import { getBalance, getPublicClient, readContract } from '@wagmi/core'
import { type GetBalanceReturnType } from '@wagmi/core'
import { parseAbiItem, type PublicClient } from 'viem'
import type { Config } from '@wagmi/core'
import type { Collection, Token, MintEvent } from '~/utils/types'
import { BLOCKS_PER_DAY } from '@visualizevalue/mint-utils/time'

// Sentinel: marks data as fully synced from the indexer.
export const INDEXER_SYNCED = BigInt(Number.MAX_SAFE_INTEGER)

// Ponder response types (bigints come as strings from GraphQL)

interface PonderCollection {
  address: string
  artist: { address: string }
  owner: string
  image: string
  name: string
  symbol: string
  description: string
  init_block: string
  latest_token_id: string
}

interface PonderArtifact {
  collection: { address: string }
  id: string
  name: string
  description: string
  image: string
  animation_url: string
  created_block: string
}

interface PonderMint {
  artifact: { id: string }
  hash: string
  block_number: string
  log_index: number
  amount: string
  unit_price: string
  price: string
  account: string
}

interface PonderProfile {
  ens: string | null
  data: {
    avatar: string
    description: string
    links: {
      url: string
      email: string
      twitter: string
      github: string
    }
  }
}


export const COLLECTIONS_BY_ARTIST = `
  query($artist: String!) {
    collections(
      where: { artist: $artist }
      orderBy: "init_block"
      orderDirection: "desc"
      limit: 1000
    ) {
      items {
        address artist { address } owner image name symbol description
        init_block latest_token_id
      }
    }
  }
`

export const COLLECTION_BY_ADDRESS = `
  query($address: String!) {
    collection(address: $address) {
      address artist { address } owner image name symbol description
      init_block latest_token_id
    }
  }
`

export const ARTIFACTS_BY_COLLECTION = `
  query($collection: String!) {
    artifacts(
      where: { collection: $collection }
      orderBy: "id"
      orderDirection: "desc"
      limit: 1000
    ) {
      items {
        collection { address } id name description image animation_url created_block
      }
    }
  }
`

export const MINTS_BY_ARTIFACT = `
  query($collection: String!, $artifact: BigInt!) {
    mints(
      where: { collection: $collection, artifact: $artifact }
      orderBy: "block_number"
      orderDirection: "desc"
      limit: 1000
    ) {
      items {
        artifact { id } hash block_number log_index
        amount unit_price price account
      }
    }
  }
`


export function transformCollections (data: { collections: { items: PonderCollection[] } }): Collection[] {
  return data.collections.items.map(toCollection)
}

export function transformCollection (data: { collection: PonderCollection | null }): Collection {
  if (!data.collection) throw new Error('Collection not found in indexer')
  return toCollection(data.collection)
}

export function transformArtifacts (data: { artifacts: { items: PonderArtifact[] } }): Token[] {
  return data.artifacts.items.map(toToken)
}

export function transformMints (data: { mints: { items: PonderMint[] } }): MintEvent[] {
  return data.mints.items.map(toMintEvent)
}


export function transformProfile (raw: PonderProfile): Partial<Artist> {
  return {
    ens: raw.ens || '',
    avatar: raw.data?.avatar || '',
    description: raw.data?.description || '',
    url: raw.data?.links?.url || '',
    email: raw.data?.links?.email || '',
    twitter: raw.data?.links?.twitter || '',
    github: raw.data?.links?.github || '',
    profileUpdatedAtBlock: INDEXER_SYNCED,
  }
}


export async function rpcFetchProfile (
  wagmi: Config,
  address: `0x${string}`,
): Promise<Partial<Artist>> {
  const client = getPublicClient(wagmi, { chainId: 1 }) as PublicClient
  const block = await client.getBlockNumber()

  let ens, avatar, description, url, email, twitter, github

  try {
    ens = await client.getEnsName({ address })
    if (ens) {
      [avatar, description, url, email, twitter, github] = await Promise.all([
        client.getEnsAvatar({ name: ens }),
        client.getEnsText({ name: ens, key: 'description' }),
        client.getEnsText({ name: ens, key: 'url' }),
        client.getEnsText({ name: ens, key: 'email' }),
        client.getEnsText({ name: ens, key: 'com.twitter' }),
        client.getEnsText({ name: ens, key: 'com.github' }),
      ])
    }
  } catch (e) { }

  return { ens, avatar, description, url, email, twitter, github, profileUpdatedAtBlock: block }
}

export async function rpcFetchCollections (
  wagmi: Config,
  chainId: number,
  artist: `0x${string}`,
  factory: `0x${string}`,
): Promise<Collection[]> {
  const addresses: `0x${string}`[] = (await readContract(wagmi, {
    abi: FACTORY_ABI,
    address: factory,
    functionName: 'getCreatorCollections',
    args: [artist],
    chainId,
  })).map((a: `0x${string}`) => a.toLowerCase() as `0x${string}`)

  const collections = await Promise.all(addresses.map(a => rpcFetchCollection(wagmi, chainId, a)))
  return collections.filter((c): c is Collection => c !== null)
}

export async function rpcFetchCollection (
  wagmi: Config,
  chainId: number,
  address: `0x${string}`,
): Promise<Collection | null> {
  try {
    const [data, version, initBlock, latestTokenId, owner, balance] = await Promise.all([
      readContract(wagmi, { abi: MINT_ABI, address, functionName: 'contractURI', chainId }) as Promise<string>,
      readContract(wagmi, { abi: MINT_ABI, address, functionName: 'version', chainId }) as Promise<bigint>,
      readContract(wagmi, { abi: MINT_ABI, address, functionName: 'initBlock', chainId }) as Promise<bigint>,
      readContract(wagmi, { abi: MINT_ABI, address, functionName: 'latestTokenId', chainId }) as Promise<bigint>,
      readContract(wagmi, { abi: MINT_ABI, address, functionName: 'owner', chainId }) as Promise<`0x${string}`>,
      getBalance(wagmi, { address }) as Promise<GetBalanceReturnType>,
    ])

    const artistAddr = owner.toLowerCase() as `0x${string}`
    const json = Buffer.from(data.substring(29), 'base64').toString()
    const metadata = JSON.parse(json)

    return {
      image: metadata.image,
      name: metadata.name,
      symbol: metadata.symbol,
      version,
      description: metadata.description,
      address,
      initBlock,
      latestTokenId,
      owner: artistAddr,
      tokens: {},
      balance: balance.value,
      renderers: [],
    }
  } catch (e) {
    console.warn(`RPC: Error fetching collection ${address}`, e)
    return null
  }
}

export async function rpcFetchCollectionTokens (
  wagmi: Config,
  chainId: number,
  collection: `0x${string}`,
): Promise<Token[]> {
  const client = getPublicClient(wagmi, { chainId }) as PublicClient
  const [latestTokenId, currentBlock] = await Promise.all([
    readContract(wagmi, {
      abi: MINT_ABI,
      address: collection,
      functionName: 'latestTokenId',
      chainId,
    }) as Promise<bigint>,
    client.getBlock(),
  ])

  const mintContract = getContract({ address: collection, abi: MINT_ABI, client })
  const tokens: Token[] = []
  const ids: bigint[] = []
  for (let id = latestTokenId; id > 0n; id--) ids.push(id)

  for (const chunk of chunkArray(ids, 10)) {
    const results = await Promise.allSettled(
      chunk.map(id => rpcFetchSingleToken(mintContract, collection, id, currentBlock))
    )
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) tokens.push(r.value)
    }
  }

  return tokens
}

async function rpcFetchSingleToken (
  mintContract: ReturnType<typeof getContract>,
  collection: `0x${string}`,
  tokenId: bigint,
  currentBlock: Awaited<ReturnType<PublicClient['getBlock']>>,
  tries: number = 0,
): Promise<Token | null> {
  try {
    const [data, dataUri] = await Promise.all([
      mintContract.read.get([tokenId]) as Promise<[string, string, `0x${string}`[], bigint, bigint, bigint, bigint]>,
      mintContract.read.uri([tokenId], {
        gas: 100_000_000_000,
        gasPrice: currentBlock.baseFeePerGas,
      }) as Promise<string>,
    ])

    const [_name, _description, _artifact, _renderer, mintedBlock, closeAt, _extraData] = data

    let metadata
    try {
      const json = Buffer.from(dataUri.substring(29), 'base64').toString()
      metadata = JSON.parse(json)
    } catch (e) {
      metadata = { name: '', description: '', image: '', animation_url: '' }
    }

    return {
      tokenId,
      collection,
      name: metadata.name,
      description: metadata.description,
      image: metadata.image,
      animationUrl: metadata.animation_url,
      mintedBlock: BigInt(`${mintedBlock}`),
      closeAt,
      mintsBackfilledUntilBlock: 0n,
      mintsFetchedUntilBlock: 0n,
      mints: [],
    }
  } catch (e) {
    if (tries < 3) return rpcFetchSingleToken(mintContract, collection, tokenId, currentBlock, tries + 1)
    return null
  }
}

export async function rpcFetchTokenMints (
  wagmi: Config,
  chainId: number,
  collection: `0x${string}`,
  tokenId: bigint,
): Promise<MintEvent[]> {
  const client = getPublicClient(wagmi, { chainId }) as PublicClient
  const mintContract = getContract({ address: collection, abi: MINT_ABI, client })

  const [tokenData, currentBlock] = await Promise.all([
    mintContract.read.get([tokenId]) as Promise<[string, string, `0x${string}`[], bigint, bigint, bigint, bigint]>,
    client.getBlockNumber(),
  ])

  const mintedBlock = BigInt(`${tokenData[4]}`)
  const untilBlock = mintedBlock + BLOCKS_PER_DAY
  const toBlock = currentBlock > untilBlock ? untilBlock : currentBlock

  return loadMintEventsRange(client, collection, tokenId, mintedBlock, toBlock)
}

async function loadMintEventsRange (
  client: PublicClient,
  collection: `0x${string}`,
  tokenId: bigint,
  fromBlock: bigint,
  toBlock: bigint,
): Promise<MintEvent[]> {
  try {
    const logs = await client.getLogs({
      address: collection,
      event: parseAbiItem('event NewMint(uint256 indexed tokenId, uint256 unitPrice, uint256 amount, address minter)'),
      args: { tokenId },
      fromBlock,
      toBlock,
    })

    return logs.map(l => ({
      tokenId,
      address: l.args.minter,
      block: l.blockNumber,
      logIndex: l.logIndex,
      tx: l.transactionHash,
      unitPrice: l.args.unitPrice,
      amount: l.args.amount,
      price: (l.args.amount || 0n) * (l.args.unitPrice || 0n),
    }) as MintEvent).reverse()
  } catch (e) {
    if (toBlock - fromBlock > 100n) {
      const mid = fromBlock + (toBlock - fromBlock) / 2n
      const [a, b] = await Promise.all([
        loadMintEventsRange(client, collection, tokenId, fromBlock, mid),
        loadMintEventsRange(client, collection, tokenId, mid + 1n, toBlock),
      ])
      return [...a, ...b]
    }
    throw e
  }
}


function toCollection (raw: PonderCollection): Collection {
  return {
    address: raw.address.toLowerCase() as `0x${string}`,
    owner: (raw.owner || raw.artist.address).toLowerCase() as `0x${string}`,
    version: 0n,
    image: raw.image || '',
    name: raw.name || '',
    symbol: raw.symbol || '',
    description: raw.description || '',
    initBlock: BigInt(raw.init_block || '0'),
    latestTokenId: BigInt(raw.latest_token_id || '0'),
    balance: 0n,
    tokens: {},
    renderers: [],
  }
}

function toToken (raw: PonderArtifact): Token {
  const mintedBlock = BigInt(raw.created_block || '0')
  return {
    collection: raw.collection.address.toLowerCase() as `0x${string}`,
    tokenId: BigInt(raw.id),
    name: raw.name || '',
    description: raw.description || '',
    image: raw.image || '',
    animationUrl: raw.animation_url || undefined,
    closeAt: mintedBlock + BLOCKS_PER_DAY,
    mintedBlock,
    mintsFetchedUntilBlock: 0n,
    mintsBackfilledUntilBlock: 0n,
    mints: [],
  }
}

function toMintEvent (raw: PonderMint): MintEvent {
  return {
    tokenId: BigInt(raw.artifact.id),
    address: raw.account.toLowerCase() as `0x${string}`,
    block: BigInt(raw.block_number),
    logIndex: raw.log_index,
    tx: raw.hash,
    unitPrice: BigInt(raw.unit_price || '0'),
    amount: BigInt(raw.amount || '0'),
    price: BigInt(raw.price || '0'),
  }
}
