import { getPublicClient, readContract } from '@wagmi/core'
import { config } from '../wagmi'

export const useOnchainStore = defineStore('onchainStore', {

  state: () => ({
    version: 1,
    artists: {} as { [key: `0x${string}`]: Artist },
    collections: {} as { [key: `0x${string}`]: Collection },
    tokenBalances: {} as { [key: `0x${string}`]: { [key: string]: bigint } }, // Collection -> Balance
  }),

  getters: {
    all: (state) => Object.values(state.collections),
    hasArtist: (state) => (address: `0x${string}`) => state.artists[address] !== undefined,
    artist: (state) => (address: `0x${string}`) => state.artists[address],
    forArtist: (state) => (address: `0x${string}`) => state.artists[address].collections
      .map(c => state.collections[c])
      .sort((a, b) => a.initBlock > b.initBlock ? -1 : 1),
    hasCollection: (state) => (address: `0x${string}`) => state.collections[address] !== undefined,
    collection: (state) => (address: `0x${string}`) => state.collections[address],
    tokens: (state) => (address: `0x${string}`) =>
        Object.values(state.collections[address].tokens)
        .sort((a: Token, b: Token) => a.tokenId > b.tokenId ? -1 : 1),
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
        updatedAtBlock: 0n,
      }

      this.artists[artist.address] = artist

      return artist
    },

    async fetchArtist (address: `0x${string}`, factory: `0x${string}`) {
      const client = getPublicClient(config, { chainId: 1 })
      const block = await client.getBlockNumber()

      // Only update once per hour
      if (
        this.hasArtist(address) &&
        this.artist(address).updatedAtBlock > 0n &&
        (block - this.artist(address).updatedAtBlock) < BLOCKS_PER_CACHE
      ) return

      let ens, avatar, description

      try {
        ens = await client.getEnsName({ address })

        if (ens) {
          [avatar, description] = await Promise.all([
            client.getEnsAvatar({ name: ens }),
            client.getEnsText({ name: ens, key: 'description' }),
          ])
        }
      } catch (e) {}

      const artist: Artist = {
        address,
        ens,
        avatar,
        description,
        collections: [],
        updatedAtBlock: 0n,
      }

      this.artists[artist.address] = artist

      await this.fetchCollections(artist.address, factory, artist.updatedAtBlock)
    },

    async fetchCollections (
      artist: `0x${string}`,
      factory: `0x${string}`,
      fromBlock: bigint = 0n,
      force: boolean = false
    ) {
      const client = getPublicClient(config, { chainId: 1337 })

      if (this.artists[artist].updatedAtBlock > fromBlock && ! force) {
        console.warn(`Collections fetched already (${this.artists[artist].updatedAtBlock})`)
        return
      }
      console.info(`Fetching collections for ${artist}`)

      try {
        const logs = await client.getContractEvents({
          abi: FACTORY_ABI,
          address: factory,
          eventName: 'Created',
          args: { ownerAddress: artist },
          strict: true,
          fromBlock,
        })

        const promises = logs.map(l => this.fetchCollection(l.args.contractAddress.toLowerCase() as `0x${string}`))

        const collections = await Promise.all(promises)

        this.artists[artist].updatedAtBlock = await client.getBlockNumber()
        this.artists[artist].collections = Array.from(new Set([
          ...this.artists[artist].collections,
          ...collections.map(c => c.address)
        ]))
      } catch (e) {
        console.error(e)
      }
    },

    async fetchCollection (address: `0x${string}`): Promise<Collection> {
      if (this.hasCollection(address)) {
        // TODO: Update Collection
        return this.collection(address)
      }

      const [data, initBlock, latestTokenId, owner] = await Promise.all([
        readContract(config, {
          abi: MINT_ABI,
          address,
          functionName: 'contractURI',
          chainId: 1337,
        }) as Promise<string>,
        readContract(config, {
          abi: MINT_ABI,
          address,
          functionName: 'initBlock',
          chainId: 1337,
        }) as Promise<bigint>,
        readContract(config, {
          abi: MINT_ABI,
          address,
          functionName: 'latestTokenId',
          chainId: 1337,
        }) as Promise<bigint>,
        readContract(config, {
          abi: MINT_ABI,
          address,
          functionName: 'owner',
          chainId: 1337,
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
      this.collections[address].latestTokenId = await readContract(config, {
        abi: MINT_ABI,
        address,
        functionName: 'latestTokenId',
        chainId: 1337,
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
      const client = getPublicClient(config, { chainId: 1337 })
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
        }

        this.collections[address].tokens[`${token.tokenId}`] = token
      } catch (e) {}
    },

    async fetchTokenBalance (token: Token, address: `0x${string}`) {
      const client = getPublicClient(config)
      const mintContract = getContract({
        address: token.collection,
        abi: MINT_ABI,
        client
      })

      if (! this.tokenBalances[token.collection]) {
        this.tokenBalances[token.collection] = {}
      }

      console.log('fetch token balance')

      this.tokenBalances[token.collection][`${token.tokenId}`] =
        await mintContract.read.balanceOf([address, token.tokenId])

      console.log('fetched token balance', this.tokenBalances[token.collection][`${token.tokenId}`])
    },

    async addCollection (collection: Collection) {
      if (this.hasCollection(collection.address)) {
        console.warn(`Replacing existing collection`)
      }

      this.collections[collection.address] = collection

      if (! this.hasArtist(collection.owner)) this.initializeArtist(collection.owner)

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

})
