import { timestamp, jsonb, pgSchema, text } from 'drizzle-orm/pg-core'

const schema = pgSchema('offchain')

export const profile = schema.table('profiles', {
  address: text().primaryKey(),
  ens: text().unique(),
  data: jsonb(),
  updated_at: timestamp(),
})
