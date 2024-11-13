import { getBalance, getPublicClient, readContract } from '@wagmi/core'
import { type GetBalanceReturnType } from '@wagmi/core'
import { parseAbiItem, type PublicClient } from 'viem'
import type { MintEvent } from '~/utils/types'

export const CURRENT_STATE_VERSION = 8
export const MAX_BLOCK_RANGE = 1800n
export const MINT_BLOCKS = BLOCKS_PER_DAY

export const useOnchainStore = () => {
  const { $wagmi } = useNuxtApp()
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
            .sort((a, b) => a.initBlock > b.initBlock ? -1 : 1)
        }
      },
      forArtistOnlyMinted () {
        return (address: `0x${string}`) => this.forArtist(address).filter(c => c.latestTokenId > 0n)
      },
      hasCollection: (state) => (address: `0x${string}`) => state.collections[address] !== undefined,
      collection: (state) => (address: `0x${string}`) => state.collections[address],
      tokens: (state) => (address: `0x${string}`) =>
        Object.values(state.collections[address].tokens)
          .sort((a: Token, b: Token) => a.tokenId > b.tokenId ? -1 : 1),
      tokenMints: (state) => (address: `0x${string}`, tokenId: bigint): MintEvent[] =>
        state.collections[address].tokens[tokenId.toString()].mints,
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

        await this.fetchArtistProfile(address)

        await this.fetchCollections(address, factory)
      },

      async fetchArtistProfile (address: `0x${string}`): Promise<Artist> {
        const client = getPublicClient($wagmi, { chainId: 1 }) as PublicClient
        const block = await client.getBlockNumber()

        // Only update once per hour
        if (
          this.hasArtist(address) &&
          this.artist(address).profileUpdatedAtBlock > 0n &&
          (block - this.artist(address).profileUpdatedAtBlock) < BLOCKS_PER_CACHE
        ) {
          console.info(`Artist profile already fetched...`)
          return this.artist(address)
        }

        console.info(`Updating artist profile...`)

        let ens, avatar, description,
          url, email, twitter, github

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

        this.artists[address].ens = ens
        this.artists[address].avatar = avatar
        this.artists[address].description = description
        this.artists[address].url = url
        this.artists[address].email = email
        this.artists[address].twitter = twitter
        this.artists[address].github = github
        this.artists[address].profileUpdatedAtBlock = block

        return this.artist(address)
      },

      async fetchCollections (
        artist: `0x${string}`,
        factory: `0x${string}`
      ) {
        const collectionAddresses: `0x${string}`[] = (await readContract($wagmi, {
          abi: FACTORY_ABI,
          address: factory,
          functionName: 'getCreatorCollections',
          args: [artist],
          chainId,
        })).map((a: `0x${string}`) => a.toLowerCase() as `0x${string}`)

        if (this.artists[artist].collections.length === collectionAddresses.length) {
          console.info(`Collections fetched already (${collectionAddresses.length} collections)`)
          return
        }

        try {
          await Promise.all(collectionAddresses.map(address => this.fetchCollection(address)))

          this.artists[artist].collections = collectionAddresses
        } catch (e) {
          console.error(e)
        }
      },

      async fetchCollection (address: `0x${string}`): Promise<Collection> {
        this.ensureStoreVersion()

        if (this.hasCollection(address) && this.collection(address).latestTokenId > 0n) {
          return this.collection(address)
        }

        const [data, initBlock, latestTokenId, owner, balance] = await Promise.all([
          readContract($wagmi, {
            abi: MINT_ABI,
            address,
            functionName: 'contractURI',
            chainId,
          }) as Promise<string>,
          readContract($wagmi, {
            abi: MINT_ABI,
            address,
            functionName: 'initBlock',
            chainId,
          }) as Promise<bigint>,
          readContract($wagmi, {
            abi: MINT_ABI,
            address,
            functionName: 'latestTokenId',
            chainId,
          }) as Promise<bigint>,
          readContract($wagmi, {
            abi: MINT_ABI,
            address,
            functionName: 'owner',
            chainId,
          }) as Promise<`0x${string}`>,
          getBalance($wagmi, {
            address,
          }) as Promise<GetBalanceReturnType>,
        ])

        const json = Buffer.from(data.substring(29), `base64`).toString()
        const metadata = JSON.parse(json)

        const artist = owner.toLowerCase() as `0x${string}`

        return await this.addCollection({
          image: metadata.image,
          name: metadata.name,
          symbol: metadata.symbol,
          description: metadata.description,
          address,
          initBlock,
          latestTokenId,
          owner: artist,
          tokens: {},
          balance: balance.value,
          renderers: [],
        })
      },

      async fetchCollectionBalance (address: `0x${string}`) {
        const balance = await getBalance($wagmi, { address })
        this.collections[address].balance = balance.value
      },

      async fetchCollectionRenderers (address: `0x${string}`) {
        const renderers = this.collections[address].renderers

        let index = renderers.length
        while (true) {
          try {
            const rendererAddress = await readContract($wagmi, {
              abi: MINT_ABI,
              address,
              functionName: 'renderers',
              args: [BigInt(index)],
              chainId,
            })

            const rendererArgs = { abi: RENDERER_ABI, address: rendererAddress, chainId }

            const [name, version] = await Promise.all([
              await readContract($wagmi, {
                ...rendererArgs,
                functionName: 'name',
              }),
              await readContract($wagmi, {
                ...rendererArgs,
                functionName: 'version',
              }),
            ])

            this.collections[address].renderers[index] = {
              address: rendererAddress.toLowerCase() as `0x${string}`,
              name,
              version,
            }

            index ++
          } catch (e) {
            console.info(`Stopped parsing renderers ${e.shortMessage || e.message}`)
            return
          }
        }
      },

      async fetchCollectionTokens (address: `0x${string}`): Promise<Token[]> {
        this.collections[address].latestTokenId = await readContract($wagmi, {
          abi: MINT_ABI,
          address,
          functionName: 'latestTokenId',
          chainId,
        }) as Promise<bigint>

        const collection = this.collection(address)

        const existingTokenIds = new Set(Object.keys(collection.tokens).map(id => BigInt(id)))

        // If we have all tokens we don't need to do anything
        if (BigInt(existingTokenIds.size) === collection.latestTokenId) return this.tokens(address)

        // Go over each token
        let id = collection.latestTokenId
        while (id > 0n) {
          if (! existingTokenIds.has(id)) {
            await this.fetchToken(address, id)
          } else {
            console.info(`Skipping token #${id} since we already have it.`)
          }

          id --
        }

        return this.tokens(address)
      },

      async fetchToken (address: `0x${string}`, id: number | string | bigint) {
        const client = getPublicClient($wagmi, { chainId }) as PublicClient
        const mintContract = getContract({
          address,
          abi: MINT_ABI,
          client,
        })

        if (this.collection(address).tokens[`${id}`]) {
          console.info(`Token cached #${id}`)
          return
        }

        // Normalize token ID
        const tokenId = BigInt(id)

        try {
          console.info(`Fetching token #${tokenId}`)

          const [data, dataUri, closeAt] = await Promise.all([
            mintContract.read.get([tokenId]) as Promise<[string, string, `0x${string}`[], bigint, bigint, bigint, bigint]>,
            mintContract.read.uri([tokenId], { gas: 100_000_000_000 }) as Promise<string>,
            mintContract.read.mintOpenUntil([tokenId]) as Promise<bigint>,
          ])

          const [ name, description, _artifact, _renderer, mintedBlock, _closeAt, _extraData ] = data

          const json = Buffer.from(dataUri.substring(29), `base64`).toString()
          const metadata = JSON.parse(json)

          const token: Token = {
            tokenId,
            collection: address,
            name,
            description,
            image: metadata.image,
            animationUrl: metadata.animation_url,

            mintedBlock: BigInt(`${mintedBlock}`), // Force bigint
            closeAt,

            mintsBackfilledUntilBlock: 0n,
            mintsFetchedUntilBlock: 0n,
            mints: []
          }

          this.collections[address].tokens[`${token.tokenId}`] = token
        } catch (e) {
          console.error(e)
        }
      },

      async fetchTokenBalance (token: Token, address: `0x${string}`) {
        const client = getPublicClient($wagmi, { chainId })
        const mintContract = getContract({
          address: token.collection,
          abi: MINT_ABI,
          client
        })

        if (! this.tokenBalances[token.collection]) {
          this.tokenBalances[token.collection] = {}
        }

        this.tokenBalances[token.collection][`${token.tokenId}`] =
          await mintContract.read.balanceOf([address, token.tokenId])

        console.info('fetched token balance', this.tokenBalances[token.collection][`${token.tokenId}`])
      },

      async fetchTokenMints (token: Token) {
        const storedToken = this.collections[token.collection].tokens[token.tokenId.toString()]
        const client = getPublicClient($wagmi, { chainId }) as PublicClient
        const currentBlock = await client.getBlockNumber()
        const untilBlock = token.mintedBlock + BLOCKS_PER_DAY

        // We want to sync until now, or when the mint closed
        const toBlock = currentBlock > untilBlock ? untilBlock : currentBlock

        if (token.mintsFetchedUntilBlock >= toBlock) {
          return console.info(`mints for #${token.tokenId} already fetched`)
        }

        // Initially, we want to sync backwards,
        // but at most 5000 blocks (the general max range for an event query)
        const maxRangeBlock = toBlock - MAX_BLOCK_RANGE
        const fromBlock = token.mintsFetchedUntilBlock > maxRangeBlock // If we've already fetched
          ? token.mintsFetchedUntilBlock + 1n // we want to continue where we left off
          : maxRangeBlock > token.mintedBlock // Otherwise we'll go back as far as possible
            ? maxRangeBlock // (to our max range)
            : token.mintedBlock // (or all the way to when the token minted)

        // Load mints in range
        this.addTokenMints(token, await this.loadMintEvents(token, fromBlock, toBlock))

        // Set sync status
        storedToken.mintsFetchedUntilBlock = toBlock

        // If this is our first fetch, mark until when we have backfilled
        if (! token.mintsBackfilledUntilBlock) {
          storedToken.mintsBackfilledUntilBlock = fromBlock
        }
      },

      async backfillTokenMints (token: Token) {
        const storedToken = this.collections[token.collection].tokens[token.tokenId.toString()]

        // If we've backfilled all the way;
        if (storedToken.mintsBackfilledUntilBlock <= token.mintedBlock) return

        // We want to fetch the tokens up until where we stopped backfilling (excluding the last block)
        const toBlock = storedToken.mintsBackfilledUntilBlock - 1n

        // We want to fetch until our max range (5000), or until when the token minted
        const fromBlock = toBlock - MAX_BLOCK_RANGE > token.mintedBlock ? toBlock - MAX_BLOCK_RANGE : token.mintedBlock
        console.info(`Backfilling token mints blocks ${fromBlock}-${toBlock}`)

        // Finally, we update our database
        this.addTokenMints(token, await this.loadMintEvents(token, fromBlock, toBlock), 'append')

        // And save until when we have backfilled our tokens.
        storedToken.mintsBackfilledUntilBlock = fromBlock
      },

      async loadMintEvents (token: Token, fromBlock: bigint, toBlock: bigint): Promise<MintEvent[]> {
        const client = getPublicClient($wagmi, { chainId }) as PublicClient

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
      },

      async addTokenMints (token: Token, mints: MintEvent[], location: 'prepend'|'append' = 'prepend') {
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
          this.fetchArtistProfile(collection.owner)
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
