export const useCollectionsStore = defineStore('collectionsStore', {

  state: () => ({
    version: 1,
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
    async addCollection(collection: Collection) {
      if (this.hasCollection(collection.address)) throw new Error('Collection already exists')

      this.collections[collection.address] = collection
    },
    async addToken(address: string, token: Token) {
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
