import { getBalance, getPublicClient, readContract } from '@wagmi/core'
import { type GetBalanceReturnType } from '@wagmi/core'
import { parseAbiItem, type PublicClient } from 'viem'
import type { MintEvent } from '~/utils/types'
import { INDEXER_SYNCED } from '~/queries/sources'

export const CURRENT_STATE_VERSION = 10
export const MAX_BLOCK_RANGE = 5000n
export const MINT_BLOCKS = BLOCKS_PER_DAY
export const MAX_RENDERERS = 20

export const useOnchainStore = () => {
  const { $wagmi, $queryClient, $queries } = useNuxtApp()
  const appConfig = useAppConfig()
  const chainId = useMainChainId()

  return defineStore('onchainStore', {

    state: () => ({
      version: CURRENT_STATE_VERSION,
      artists: {} as { [key: `0x${string}`]: Artist },
      collections: {} as { [key: `0x${string}`]: Collection },
      // Collection -> Balance (just for the current user)
      tokenBalances: {} as { [key: `0x${string}`]: { [key: string]: bigint } },
    }),

    getters: {
      all (state) {
        return Object.values(state.collections)
      },
      hasArtist (state) {
        return (address: `0x${string}`) => state.artists[address] !== undefined
      },
      artist (state) {
        return (address: `0x${string}`) => state.artists[address]
      },
      ens () {
        return (address: `0x${string}`) => this.artist(address)?.ens
      },
      displayName () {
        return (address: `0x${string}`) => this.ens(address) || shortAddress(address)
      },
      forArtist (state) {
        return (address: `0x${string}`) => {
          if (! this.hasArtist(address)) return []

          return this.artist(address).collections
            .map(c => state.collections[c])
            .filter(c => !!c)
            .sort((a, b) => a.initBlock > b.initBlock ? -1 : 1)
        }
      },
      forArtistOnlyMinted () {
        return (address: `0x${string}`) => this.forArtist(address).filter(c => c.latestTokenId > 0n)
      },
      hasCollection: (state) => (address: `0x${string}`) => state.collections[address] !== undefined,
      collection: (state) => (address: `0x${string}`) => state.collections[address],
      tokens: (state) => (address: `0x${string}`) =>
        state.collections[address]
          ? Object.values(state.collections[address].tokens)
              .sort((a: Token, b: Token) => a.tokenId > b.tokenId ? -1 : 1)
          : [],
      tokenMints: (state) => (address: `0x${string}`, tokenId: bigint): MintEvent[] =>
        state.collections[address]?.tokens[tokenId.toString()]?.mints ?? [],
      tokenBalance: (state) => (address: `0x${string}`, tokenId: bigint): bigint | null =>
        (state.tokenBalances[address] && (state.tokenBalances[address][`${tokenId}`] !== undefined))
          ? state.tokenBalances[address][`${tokenId}`]
          : null,
    },

    actions: {
      initializeArtist (address: `0x${string}`) {
        const artist: Artist = {
          address,
          ens: '',
          avatar: '',
          description: '',
          collections: [],
          profileUpdatedAtBlock: 0n,
        }

        this.artists[artist.address] = artist

        return artist
      },

      ensureStoreVersion () {
        if (this.version < CURRENT_STATE_VERSION) {
          console.info(`Reset store`)
          this.$reset()
        }
      },

      async fetchArtistScope (address: `0x${string}`, factory: `0x${string}`) {
        this.ensureStoreVersion()

        if (!this.hasArtist(address)) this.initializeArtist(address)

        await Promise.all([
          this.fetchArtistProfile(address),
          this.fetchCollections(address, factory),
        ])
      },

      async fetchArtistProfile (address: `0x${string}`): Promise<Artist> {
        if (!this.hasArtist(address)) this.initializeArtist(address)

        const profile = await $queryClient.fetch($queries.artistProfile, address)
        Object.assign(this.artists[address], profile)
        return this.artist(address)
      },

      async fetchCollections (
        artist: `0x${string}`,
        factory: `0x${string}`
      ) {
        const collections = await $queryClient.fetch($queries.artistCollections, artist)
        const newCollections = collections.filter(c => !this.hasCollection(c.address))
        await Promise.all(newCollections.map(c => this.addCollection(c)))

        this.artists[artist].collections = Array.from(new Set([
          ...this.artists[artist].collections,
          ...collections.map(c => c.address),
        ]))
      },

      async fetchCollection (address: `0x${string}`): Promise<Collection> {
        this.ensureStoreVersion()

        if (this.hasCollection(address) && this.collection(address).latestTokenId > 0n) {
          return this.collection(address)
        }

        const collection = await $queryClient.fetch($queries.collection, address)
        if (collection) return await this.addCollection(collection)

        // If both sources returned null, the collection doesn't exist
        throw new Error(`Collection ${address} not found`)
      },

      async fetchCollectionBalance (address: `0x${string}`) {
        const balance = await getBalance($wagmi, { address })
        this.collections[address].balance = balance.value
      },

      async fetchCollectionRenderers (address: `0x${string}`) {
        const renderers = this.collections[address].renderers

        let index = renderers.length
        while (index < MAX_RENDERERS) {
          try {
            const rendererAddress = (await readContract($wagmi, {
              abi: MINT_ABI,
              address,
              functionName: 'renderers',
              args: [BigInt(index)],
              chainId,
            }))?.toLowerCase() as `0x${string}`

            const rendererArgs = { abi: RENDERER_ABI, address: rendererAddress, chainId }

            const [name, version] = await Promise.all([
              readContract($wagmi, {
                ...rendererArgs,
                functionName: 'name',
              }),
              readContract($wagmi, {
                ...rendererArgs,
                functionName: 'version',
              }),
            ])

            this.collections[address].renderers[index] = {
              address: rendererAddress,
              name,
              version,
              // Enrich with configured renderer data
              ...appConfig.knownRenderers[chainId].find(r => r.address === rendererAddress)
            }

            index ++
          } catch (e) {
            console.info(`Stopped parsing renderers ${e.shortMessage || e.message}`)
            return
          }
        }
      },

      async fetchCollectionTokens (address: `0x${string}`): Promise<Token[]> {
        const tokens = await $queryClient.fetch($queries.collectionTokens, address)

        for (const token of tokens) {
          if (!this.collections[address].tokens[`${token.tokenId}`]) {
            this.collections[address].tokens[`${token.tokenId}`] = token
          }
        }

        if (tokens.length > 0) {
          const maxId = tokens.reduce((max, t) => t.tokenId > max ? t.tokenId : max, 0n)
          if (maxId > this.collections[address].latestTokenId) {
            this.collections[address].latestTokenId = maxId
          }
        }

        return this.tokens(address)
      },

      async fetchToken (address: `0x${string}`, id: number | string | bigint, tries: number = 0): Promise<void> {
        const client = getPublicClient($wagmi, { chainId }) as PublicClient
        const mintContract = getContract({
          address,
          abi: MINT_ABI,
          client,
        })

        if (this.collection(address)?.tokens[`${id}`]) {
          return
        }

        const tokenId = BigInt(id)

        try {
          const currentBlock = await client.getBlock()

          const [data, dataUri] = await Promise.all([
            mintContract.read.get([tokenId]) as Promise<[string, string, `0x${string}`[], bigint, bigint, bigint, bigint]>,
            mintContract.read.uri([tokenId], {
              gas: 100_000_000_000,
              gasPrice: currentBlock.baseFeePerGas,
            }) as Promise<string>,
          ])

          const [ _name, _description, _artifact, _renderer, mintedBlock, closeAt, _extraData ] = data

          let metadata
          try {
            const json = Buffer.from(dataUri.substring(29), `base64`).toString()
            metadata = JSON.parse(json)
          } catch (e) {
            metadata = { name: '', description: '', image: '', animationUrl: '' }
            console.warn(`Parsing data uri failed`, e)
          }

          const token: Token = {
            tokenId,
            collection: address,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            animationUrl: metadata.animation_url,
            mintedBlock: BigInt(`${mintedBlock}`),
            closeAt,
            mintsBackfilledUntilBlock: 0n,
            mintsFetchedUntilBlock: 0n,
            mints: []
          }

          this.collections[address].tokens[`${token.tokenId}`] = token

          if (tokenId > this.collections[address].latestTokenId) {
            this.collections[address].latestTokenId = tokenId
          }
        } catch (e) {
          if (tries < 3) {
            return await this.fetchToken(address, id, tries + 1)
          }
        }
      },

      clearTokenBalance (token: Token) {
        this.tokenBalances[token.collection] = {}
      },

      clearAllTokenBalances () {
        this.tokenBalances = {}
      },

      async fetchTokenBalance (token: Token, address: `0x${string}`) {
        const client = getPublicClient($wagmi, { chainId })
        const mintContract = getContract({
          address: token.collection,
          abi: MINT_ABI,
          client
        })

        if (! this.tokenBalances[token.collection]) {
          this.clearTokenBalance(token)
        }

        this.tokenBalances[token.collection][`${token.tokenId}`] =
          await mintContract.read.balanceOf([address, token.tokenId])

        console.info('fetched token balance', this.tokenBalances[token.collection][`${token.tokenId}`])
      },

      async fetchTokenMints (token: Token) {
        const storedToken = this.collections[token.collection].tokens[token.tokenId.toString()]

        // If the indexer query has sources, use dapp-query
        if ($queries.tokenMints.sources.length) {
          try {
            storedToken.mints = await $queryClient.fetch($queries.tokenMints, token.collection as `0x${string}`, token.tokenId)
            storedToken.mintsFetchedUntilBlock = INDEXER_SYNCED
            storedToken.mintsBackfilledUntilBlock = 0n
            return
          } catch (e) {
            console.warn('Indexer mints fetch failed, falling back to incremental RPC', e)
          }
        }

        // Incremental RPC fallback for mint events
        const client = getPublicClient($wagmi, { chainId }) as PublicClient
        const currentBlock = await client.getBlockNumber()
        const untilBlock = token.mintedBlock + BLOCKS_PER_DAY

        const toBlock = currentBlock > untilBlock ? untilBlock : currentBlock

        if (token.mintsFetchedUntilBlock >= toBlock) {
          return console.info(`mints for #${token.tokenId} already fetched`)
        }

        const maxRangeBlock = toBlock - MAX_BLOCK_RANGE
        const fromBlock = token.mintsFetchedUntilBlock > maxRangeBlock
          ? token.mintsFetchedUntilBlock + 1n
          : maxRangeBlock > token.mintedBlock
            ? maxRangeBlock
            : token.mintedBlock

        this.addTokenMints(token, await this.loadMintEvents(token, fromBlock, toBlock))

        storedToken.mintsFetchedUntilBlock = toBlock

        if (! token.mintsBackfilledUntilBlock) {
          storedToken.mintsBackfilledUntilBlock = fromBlock
        }
      },

      async backfillTokenMints (token: Token) {
        const storedToken = this.collections[token.collection].tokens[token.tokenId.toString()]

        if (storedToken.mintsBackfilledUntilBlock <= token.mintedBlock) return

        const toBlock = storedToken.mintsBackfilledUntilBlock - 1n

        const fromBlock = toBlock - MAX_BLOCK_RANGE > token.mintedBlock ? toBlock - MAX_BLOCK_RANGE : token.mintedBlock
        console.info(`Backfilling token mints blocks ${fromBlock}-${toBlock}`)

        this.addTokenMints(token, await this.loadMintEvents(token, fromBlock, toBlock), 'append')

        storedToken.mintsBackfilledUntilBlock = fromBlock
      },

      async loadMintEvents (token: Token, fromBlock: bigint, toBlock: bigint): Promise<MintEvent[]> {
        const client = getPublicClient($wagmi, { chainId }) as PublicClient

        try {
          const logs = await client.getLogs({
            address: token.collection,
            event: parseAbiItem('event NewMint(uint256 indexed tokenId, uint256 unitPrice, uint256 amount, address minter)'),
            args: {
              tokenId: BigInt(token.tokenId),
            },
            fromBlock,
            toBlock,
          })

          console.info(`Token mints fetched from ${fromBlock}-${toBlock}`)

          return logs.map(l => ({
            tokenId: token.tokenId,
            address: l.args.minter,
            block: l.blockNumber,
            logIndex: l.logIndex,
            tx: l.transactionHash,
            unitPrice: l.args.unitPrice,
            amount: l.args.amount,
            price: ( l.args.amount || 0n ) * ( l.args.unitPrice || 0n ),
          }) as MintEvent).reverse()
        } catch (e) {
          // Adaptive range reduction: split in half and retry
          if (toBlock - fromBlock > 100n) {
            const mid = fromBlock + (toBlock - fromBlock) / 2n
            const [a, b] = await Promise.all([
              this.loadMintEvents(token, fromBlock, mid),
              this.loadMintEvents(token, mid + 1n, toBlock),
            ])
            return [...a, ...b]
          }
          throw e
        }
      },

      addTokenMints (token: Token, mints: MintEvent[], location: 'prepend'|'append' = 'prepend') {
        const storedToken = this.collections[token.collection].tokens[token.tokenId.toString()]

        storedToken.mints = location === 'prepend'
          ? [ ...mints, ...storedToken.mints ]
          : [ ...storedToken.mints, ...mints ]
      },

      async addCollection (collection: Collection) {
        if (this.hasCollection(collection.address)) {
          console.warn(`Replacing existing collection`)
        }

        this.collections[collection.address] = collection

        if (! this.hasArtist(collection.owner)) {
          this.initializeArtist(collection.owner)
          this.fetchArtistProfile(collection.owner).catch(e => console.warn(`Failed to fetch artist profile`, e))
        }

        this.artists[collection.owner].collections = Array.from(new Set([
          ...this.artists[collection.owner].collections,
          collection.address
        ]))

        return collection
      },
    },

    persist: {
      storage: persistedState.localStorage,
      serializer: {
        serialize: stringifyJSON,
        deserialize: parseJSON,
      },
    },

  })()
}
