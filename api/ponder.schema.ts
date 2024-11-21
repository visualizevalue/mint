import { onchainTable, relations } from '@ponder/core'

export const account = onchainTable('accounts', (t) => ({
  address: t.hex().primaryKey(),
  ens: t.text(),
}))

export const profile = onchainTable('profiles', (t) => ({
  ens: t.text().primaryKey(),
  avatar: t.text(),
  description: t.text(),
  links: t.jsonb().$type<{ [key: string]: string }>(),
  last_updated: t.bigint(),
}))

export const collection = onchainTable('collections', (t) => ({
  address: t.hex().primaryKey(),
  artist: t.hex(),
  owner: t.hex(),
  name: t.text(),
  image: t.text(),
  description: t.text(),
  icon: t.text(),
  init_block: t.bigint(),
  total_supply: t.bigint(),
  latest_token_id: t.bigint(),
}))

export const artifact = onchainTable('artifacts', (t) => ({
  id: t.bigint().primaryKey(),
  collection: t.hex(),
  name: t.text(),
  description: t.text(),
  image: t.text(),
  animation_url: t.text(),
}))

export type EventType = 'NewMint'|'TransferSingle'|'TransferBatch'
export const event = onchainTable('events', (t) => ({
  id: t.bigint().primaryKey(),
  type: t.text().$type<EventType>(),
  artifact: t.bigint(),
  from: t.hex(),
  to: t.hex(),
  amount: t.bigint(),
}))

export const accountRelations = relations(account, ({ many, one }) => ({
  collections: many(collection, {
    fields: [collection.artist],
    references: [account.address],
  }),
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
  artifacts: many(artifact, {
    fields: [artifact.collection],
    references: [collection.address],
  }),
}))

export const artifactsRelations = relations(artifact, ({ many, one }) => ({
  collection: one(collection, {
    fields: [artifact.collection],
    references: [collection.address],
  }),
  events: many(event, {
    fields: [event.artifact],
    references: [artifact.id],
  }),
}))

export const eventsRelations = relations(event, ({ one }) => ({
  artifact: one(artifact, {
    fields: [event.artifact],
    references: [artifact.id],
  }),
}))

