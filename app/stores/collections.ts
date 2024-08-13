export const useCollectionsStore = defineStore('collectionsStore', {

  state: () => ({
    collections: [] as Collection[],
  }),

  getters: {
    collectionIndexByAddress: (state) =>
      (address: string) => state.collections.findIndex((c) => c.address === address),
    collectionByAddress: (state) =>
      (address: string) => state.collections.find((c) => c.address === address),
  },

  actions: {
    async addCollection(collection: Collection) {
      const existing = this.collectionByAddress(collection.address)

      if (existing) return

      this.collections.push(collection)
    },
    async addToken(address: string, token: Token) {
      const index = this.collectionIndexByAddress(address)

      if (index < 0) throw new Error('Unknown collection')

      this.collections[index].tokens.push(token)
    },
  }

})

interface Collection {
  image: string
  name: string
  symbol: string
  description: string
  address: string
  initBlock: bigint
  tokens: Token[]
}

interface Token {
  name: string
  description: string
  artifact: string
  renderer: bigint
  blocks: bigint
  data: bigint
}
