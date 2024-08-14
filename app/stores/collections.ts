import { getPublicClient, readContract } from '@wagmi/core'
import { config } from '../wagmi'

export const useCollectionsStore = defineStore('collectionsStore', {

  state: () => ({
    version: 1,
    fetched: 0,
    collections: {} as { [key: string]: Collection },
  }),

  getters: {
    all: (state) => Object.values(state.collections),
    hasCollection: (state) =>
      (address: string) => state.collections[address] !== undefined,
    collection: (state) =>
      (address: string) => state.collections[address],
  },

  actions: {
    async fetchCollections (address: `0x${string}`, contract: `0x${string}`, force: boolean = false) {
      const client = getPublicClient(config)

      if (this.fetched && ! force) return

      const logs = await client.getContractEvents({
        abi: FACTORY_ABI,
        address: contract,
        eventName: 'Created',
        args: { ownerAddress: address },
        strict: true,
      })

      const promises = logs.map(l => this.fetchCollection(l.args.contractAddress.toLowerCase() as `0x${string}`))

      await Promise.all(promises)

      this.fetched = nowInSeconds()
    },

    async fetchCollection (address: `0x${string}`) {
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

      if (this.hasCollection(address)) {
        // TODO: Update Collection
      } else {
        await this.addCollection({
          image: metadata.image,
          name: metadata.name,
          symbol: metadata.symbol,
          description: metadata.description,
          address,
          initBlock,
          latestTokenId,
          owner: owner.toLowerCase() as `0x${string}`,
          tokens: [],
        })
      }

    },

    async addCollection (collection: Collection) {
      if (this.hasCollection(collection.address)) throw new Error('Collection already exists')

      this.collections[collection.address] = collection
    },

    async addToken (address: string, token: Token) {
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

export interface Collection {
  image: string
  name: string
  symbol: string
  description: string
  address: string
  owner: `0x${string}`
  initBlock: bigint
  latestTokenId: bigint
  tokens: Token[]
}

export interface Token {
  tokenId: bigint
  name: string
  description: string
  artifact: string
  renderer: bigint
  blocks: bigint
  data: bigint
}
