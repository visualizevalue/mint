import { onchainTable, relations } from '@ponder/core'

export const collections = onchainTable('collections', (t) => ({
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

export const artifacts = onchainTable('artifacts', (t) => ({
  id: t.bigint().primaryKey(),
  collection: t.hex(),
  name: t.text(),
  description: t.text(),
  image: t.text(),
  animation_url: t.text(),
}))

export type EventType = 'NewMint'|'TransferSingle'|'TransferBatch'
export const events = onchainTable('events', (t) => ({
  id: t.bigint().primaryKey(),
  type: t.text().$type<EventType>(),
  artifact: t.bigint(),
  from: t.hex(),
  to: t.hex(),
  amount: t.bigint(),
}))

export const collectionsRelations = relations(collections, ({ many }) => ({
  artifacts: many(artifacts, {
    fields: [artifacts.collection],
    references: [collections.address],
  })
}))

export const artifactsRelations = relations(artifacts, ({ many, one }) => ({
  collection: one(collections, {
    fields: [artifacts.collection],
    references: [collections.address],
  }),
  events: many(events, {
    fields: [events.artifact],
    references: [artifacts.id],
  }),
}))

export const eventsRelations = relations(events, ({ one }) => ({
  artifact: one(artifacts, {
    fields: [events.artifact],
    references: [artifacts.id],
  }),
}))

