import { getPublicClient, readContract } from '@wagmi/core'
import { parseAbiItem } from 'viem'
import type { MintEvent } from '~/utils/types'

export const useOnchainStore = () => {
  const { $wagmi } = useNuxtApp()
  const chainId = useMainChainId()

  return defineStore('onchainStore', {

    state: () => ({
      version: 1,
      artists: {} as { [key: `0x${string}`]: Artist },
      collections: {} as { [key: `0x${string}`]: Collection },
      // Collection -> Balance (just for the current user)
      tokenBalances: {} as { [key: `0x${string}`]: { [key: string]: bigint } },
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
      tokenBalance: (state) => (address: `0x${string}`, tokenId: bigint): bigint|null =>
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

      async fetchArtistScope (address: `0x${string}`, factory: `0x${string}`) {
        if (! this.hasArtist(address)) this.initializeArtist(address)

        await this.fetchArtistProfile(address)

        await this.fetchCollections(address, factory)
      },

      async fetchArtistProfile (address: `0x${string}`): Promise<Artist> {
        const client = getPublicClient($wagmi, { chainId: 1 })
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
        } catch (e) {}

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
        })).map((a: `0x${string}`) => a.toLowerCase())

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
        if (this.hasCollection(address) && this.collection(address).latestTokenId > 0n) {
          return this.collection(address)
        }

        const [data, initBlock, latestTokenId, owner] = await Promise.all([
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
        })
      },

      async fetchCollectionTokens (address: `0x${string}`): Promise<Token[]> {
        this.collections[address].latestTokenId = await readContract($wagmi, {
          abi: MINT_ABI,
          address,
          functionName: 'latestTokenId',
          chainId,
        })

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

      async fetchToken (address: `0x${string}`, id: bigint) {
        const client = getPublicClient($wagmi, { chainId })
        const mintContract = getContract({
          address,
          abi: MINT_ABI,
          client,
        })

        try {
          console.info(`Fetching token #${id}`)

          const [data, untilBlock] = await Promise.all([
            mintContract.read.uri([id], { gas: 10_000_000_000 }) as Promise<string>,
            mintContract.read.mintOpenUntil([id]) as Promise<bigint>,
          ])

          const json = Buffer.from(data.substring(29), `base64`).toString()
          const metadata = JSON.parse(json)

          const token: Token = {
            tokenId: id,
            collection: address,
            name: metadata.name,
            description: metadata.description,
            artifact: metadata.image,
            untilBlock,
            mintsBackfilledUntilBlock: 0n,
            mintsFetchedUntilBlock: 0n,
            mints: []
          }

          this.collections[address].tokens[`${token.tokenId}`] = token
        } catch (e) {}
      },

      async fetchTokenBalance (token: Token, address: `0x${string}`) {
        const client = getPublicClient($wagmi)
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
        const client = getPublicClient($wagmi)

        // We want to sync backwards from now
        const currentBlock = await client.getBlockNumber()

        // Until when
        const toBlock = currentBlock > token.untilBlock ? token.untilBlock : currentBlock

        if (token.mintsFetchedUntilBlock >= toBlock) return console.info(`Already fetched`)

        // From when
        const maxRangeBlock = toBlock - 5000n
        const mintedAtBlock = token.untilBlock - 7200n
        const fromBlock = token.mintsFetchedUntilBlock > maxRangeBlock
          ? token.mintsFetchedUntilBlock
          : maxRangeBlock > mintedAtBlock
          ? maxRangeBlock
          : mintedAtBlock

        // Load mints
        this.collections[token.collection].tokens[token.tokenId.toString()].mints = [
          ...this.collections[token.collection].tokens[token.tokenId.toString()].mints,
          ...await this.loadMintEvents(
            token,
            fromBlock,
            toBlock
          )
        ]

        console.info(`Token mints fetched from ${fromBlock}-${toBlock}`)

        // Set sync status
        this.collections[token.collection].tokens[token.tokenId.toString()].mintsFetchedUntilBlock = toBlock

        // If this is our first fetch, mark until when we have backfilled
        if (! token.mintsBackfilledUntilBlock) {
          this.collections[token.collection].tokens[token.tokenId.toString()].mintsBackfilledUntilBlock = fromBlock
        }
      },

      async backfillTokenMints (token: Token) {
        const mintedAtBlock = token.untilBlock - 7200n

        while (
          this.collections[token.collection].tokens[token.tokenId.toString()].mintsBackfilledUntilBlock > mintedAtBlock
        ) {
          const toBlock = this.collections[token.collection].tokens[token.tokenId.toString()].mintsBackfilledUntilBlock
          const fromBlock = toBlock - 5000n > mintedAtBlock ? toBlock - 5000n : mintedAtBlock
          console.log(`Backfilling token mints blocks ${fromBlock}-${toBlock}`)

          this.collections[token.collection].tokens[token.tokenId.toString()].mints = [
            ...this.collections[token.collection].tokens[token.tokenId.toString()].mints,
            ...await this.loadMintEvents(token, fromBlock, toBlock)
          ]

          this.collections[token.collection].tokens[token.tokenId.toString()].mintsBackfilledUntilBlock = fromBlock
        }
      },

      async loadMintEvents (token: Token, fromBlock: bigint, toBlock: bigint) {
        const client = getPublicClient($wagmi)

        const logs = await client.getLogs({
          address: token.collection,
          event: parseAbiItem('event NewMint(uint256 indexed tokenId, uint256 unitPrice, uint256 amount)'),
          args: {
            tokenId: token.tokenId,
          },
          fromBlock,
          toBlock,
        })

        return logs.map(l => ({
          tokenId: token.tokenId,
          address: l.address,
          block: l.blockNumber,
          logIndex: l.logIndex,
          tx: l.transactionHash,
          unitPrice: l.args.unitPrice,
          amount: l.args.amount,
          price: l.args.amount * l.args.unitPrice,
        })).reverse()
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

