import { onchainTable, primaryKey, relations } from 'ponder'

// ===========================================================================
//                                   MODELS
// ===========================================================================

export const account = onchainTable('accounts', (t) => ({
  address: t.hex().primaryKey(),
  ens: t.text(),
  ens_updated_at: t.bigint(),
}))

export const profile = onchainTable('profiles', (t) => ({
  ens: t.text().primaryKey(),
  avatar: t.text(),
  description: t.text(),
  links: t.jsonb().$type<{ [key: string]: string }>(),
  updated_at: t.bigint(),
}))

export const collection = onchainTable('collections', (t) => ({
  address: t.hex().primaryKey(),
  artist: t.hex(),
  owner: t.hex(),
  image: t.text(),
  name: t.text(),
  symbol: t.text(),
  description: t.text(),
  init_block: t.bigint(),
  total_supply: t.bigint(),
  latest_token_id: t.bigint(),
}))

export const artifact = onchainTable(
  'artifacts',
  (t) => ({
    collection: t.hex(),
    id: t.bigint(),
    name: t.text(),
    description: t.text(),
    image: t.text(),
    animation_url: t.text(),
    supply: t.bigint(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.collection, table.id],
    }),
  }),
)

export const ownership = onchainTable(
  'ownerships',
  (t) => ({
    account: t.hex(),
    collection: t.hex(),
    artifact: t.bigint(),
    balance: t.bigint(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.account, table.collection, table.artifact],
    }),
  }),
)

export const mint = onchainTable(
  'mints',
  (t) => ({
    collection: t.hex(), // The collection address
    artifact: t.bigint(), // The Token ID
    hash: t.hex(),
    block_number: t.bigint(),
    log_index: t.integer(),
    timestamp: t.bigint(),
    gas_used: t.bigint(),
    gas_price: t.bigint(), // The price per gas
    gas_fee: t.bigint(), // The total fee
    amount: t.bigint(),
    unit_price: t.bigint(),
    price: t.bigint(),
    account: t.hex(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [table.hash, table.block_number, table.log_index],
    }),
  }),
)

export const transfer = onchainTable(
  'transfers',
  (t) => ({
    collection: t.hex(), // The collection address
    artifact: t.bigint(), // The Token ID
    hash: t.hex(),
    block_number: t.bigint(),
    log_index: t.integer(),
    timestamp: t.bigint(),
    from: t.hex(),
    to: t.hex(),
    amount: t.bigint(),
  }),
  (table) => ({
    pk: primaryKey({
      columns: [
        table.collection,
        table.artifact,
        table.hash,
        table.block_number,
        table.log_index,
      ],
    }),
  }),
)

// ===========================================================================
//                                 RELATIONS
// ===========================================================================

export const accountRelations = relations(account, ({ many, one }) => ({
  collections: many(collection),
  profile: one(profile, {
    fields: [account.ens],
    references: [profile.ens],
  }),
}))

export const collectionsRelations = relations(collection, ({ many, one }) => ({
  artist: one(account, {
    fields: [collection.artist],
    references: [account.address],
  }),
  artifacts: many(artifact),
}))

export const artifactsRelations = relations(artifact, ({ many, one }) => ({
  collection: one(collection, {
    fields: [artifact.collection],
    references: [collection.address],
  }),
  mints: many(mint),
  transfers: many(transfer),
}))

export const ownershipRelations = relations(ownership, ({ one }) => ({
  account: one(account, {
    fields: [ownership.account],
    references: [account.address],
  }),
  collection: one(collection, {
    fields: [ownership.collection],
    references: [collection.address],
  }),
  artifact: one(artifact, {
    fields: [ownership.collection, ownership.artifact],
    references: [artifact.collection, artifact.id],
  }),
}))

export const mintRelations = relations(mint, ({ one }) => ({
  artifact: one(artifact, {
    fields: [mint.artifact],
    references: [artifact.id],
  }),
}))

export const transferRelations = relations(transfer, ({ one }) => ({
  artifact: one(artifact, {
    fields: [transfer.artifact],
    references: [artifact.id],
  }),
}))
