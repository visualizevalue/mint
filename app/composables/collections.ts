import { getPublicClient, readContract } from '@wagmi/core'

export const useOnchainStore = () => {
  const { $wagmi } = useNuxtApp()

  return defineStore('onchainStore', {

    state: () => ({
      version: 1,
      artists: {} as { [key: `0x${string}`]: Artist },
      collections: {} as { [key: `0x${string}`]: Collection },
      tokenBalances: {} as { [key: `0x${string}`]: { [key: string]: bigint } }, // Collection -> Balance
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
          collectionsFetchedUntilBlock: 0n,
        }

        this.artists[artist.address] = artist

        return artist
      },

      async fetchArtistScope (address: `0x${string}`, factory: `0x${string}`) {
        if (! this.hasArtist(address)) this.initializeArtist(address)

        const artist = await this.fetchArtistProfile(address)

        await this.fetchCollections(address, factory, artist.collectionsFetchedUntilBlock)
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

        this.artists[address].ens = ens
        this.artists[address].avatar = avatar
        this.artists[address].description = description
        this.artists[address].profileUpdatedAtBlock = block

        return this.artist(address)
      },

      async fetchCollections (
        artist: `0x${string}`,
        factory: `0x${string}`,
        fromBlock: bigint = 0n
      ) {
        if ((this.artists[artist].collectionsFetchedUntilBlock > 0 || this.artists[artist].collectionsFetchedUntilBlock > fromBlock)) {
          console.info(`Collections fetched already (${this.artists[artist].collectionsFetchedUntilBlock})`)
          return
        }

        try {
          const client = getPublicClient($wagmi, { chainId: 1337 })

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

          this.artists[artist].collectionsFetchedUntilBlock = await client.getBlockNumber()
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
          readContract($wagmi, {
            abi: MINT_ABI,
            address,
            functionName: 'contractURI',
            chainId: 1337,
          }) as Promise<string>,
          readContract($wagmi, {
            abi: MINT_ABI,
            address,
            functionName: 'initBlock',
            chainId: 1337,
          }) as Promise<bigint>,
          readContract($wagmi, {
            abi: MINT_ABI,
            address,
            functionName: 'latestTokenId',
            chainId: 1337,
          }) as Promise<bigint>,
          readContract($wagmi, {
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
        this.collections[address].latestTokenId = await readContract($wagmi, {
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
        const client = getPublicClient($wagmi, { chainId: 1337 })
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
        const client = getPublicClient($wagmi)
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

  })()
}
