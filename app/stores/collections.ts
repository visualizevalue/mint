export const useCollectionsStore = defineStore('collectionsStore', {

  state: () => ({
    collections: [] as Collection[],
    collectionIndexes: {} as { [key: string]: number },
  }),

  getters: {
    hasCollection: (state) =>
      (address: string) => state.collectionIndexes[address] !== undefined,
    collectionIndexByAddress: (state) =>
      (address: string) => state.collectionIndexes[address],
    collectionByAddress: (state) =>
      (address: string) => state.collections[state.collectionIndexes[address]],
  },

  actions: {
    async addCollection(collection: Collection) {
      if (this.hasCollection(collection.address)) return

      // Add new collection
      this.collections.push(collection)

      // Maintain collection index map
      this.collectionIndexes[collection.address] = this.collections.length - 1
    },
    async addToken(address: string, token: Token) {
      const index = this.collectionIndexByAddress(address)

      if (index < 0) throw new Error('Unknown collection')

      this.collections[index].tokens.push(token)
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
