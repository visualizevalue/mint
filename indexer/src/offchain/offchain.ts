import { index, jsonb, pgSchema, text, varchar } from 'drizzle-orm/pg-core'

export const offchainSchema = pgSchema('offchain')

// Create a hex type for drizzle that matches ponder's hex type
// This type is only for drizzle-kit migrations
const drizzleHex = () => varchar('address', { length: 42 })

export const profile = offchainSchema.table(
  'profiles',
  {
    address: drizzleHex().primaryKey(),
    ens: text().notNull(),
    data: jsonb(),
  },
  (table) => {
    return {
      ensIdx: index('ens_idx').on(table.ens)
    }
  },
)
