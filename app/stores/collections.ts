import { getPublicClient, readContract } from '@wagmi/core'
import { config } from '../wagmi'

export const useOnchainStore = defineStore('onchainStore', {

  state: () => ({
    version: 1,
    artists: {} as { [key: `0x${string}`]: Artist },
    collections: {} as { [key: string]: Collection },
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
      const client = getPublicClient(config)
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
      const client = getPublicClient(config)

      if (this.artists[artist].updatedAtBlock > fromBlock && ! force) {
        console.warn(`Collections fetched already (${this.artists[artist].updatedAtBlock})`)
        return
      }
      console.info(`Fetching collections for ${artist}`)

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
        }) as Promise<string>,
        readContract(config, {
          abi: MINT_ABI,
          address,
          functionName: 'initBlock',
        }) as Promise<bigint>,
        readContract(config, {
          abi: MINT_ABI,
          address,
          functionName: 'latestTokenId',
        }) as Promise<bigint>,
        readContract(config, {
          abi: MINT_ABI,
          address,
          functionName: 'owner',
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
        tokens: [],
      })
    },

    async fetchToken (address: `0x${string}`, id: bigint) {

    },

    async addCollection (collection: Collection) {
      if (this.hasCollection(collection.address)) throw new Error('Collection already exists')

      this.collections[collection.address] = collection

      if (! this.hasArtist(collection.owner)) this.initializeArtist(collection.owner)

      this.artists[collection.owner].collections = Array.from(new Set([
        ...this.artists[collection.owner].collections,
        collection.address
      ]))

      return collection
    },

    async addToken (address: `0x${string}`, token: Token) {
      if (! this.hasCollection(address)) throw new Error('Unknown collection')

      this.collections[address].tokens.push(token)
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
