import { index, jsonb, pgSchema, text } from 'drizzle-orm/pg-core'
import { hex } from 'ponder'

export const offchainSchema = pgSchema('offchain')

export const profile = offchainSchema.table(
  'profiles',
  {
    address: hex().primaryKey(),
    ens: text().notNull(),
    data: jsonb(),
  },
  (table) => {
    index('ens_idx').on(table.ens)
  },
)
