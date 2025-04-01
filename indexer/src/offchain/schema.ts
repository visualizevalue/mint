import { Table, is, relations } from 'drizzle-orm'
import * as _ponderSchema from '../../ponder.schema'
import * as offchainSchema from './offchain'

// Note: We need a separate file for merging the schemas because
// "ponder.schema" can't be executed by drizzle-kit, and we also
// don't want drizzle to generate migrations for onchain tables.

// Note: `_ponderSchema` doesn't have information about which database schema
// to use, so we need to set it manually.

const setDatabaseSchema = <T extends { [name: string]: unknown }>(
  schema: T,
  schemaName: string,
): T => {
  for (const table of Object.values(schema)) {
    if (is(table, Table)) {
      table[Symbol.for('drizzle:Schema')] = schemaName
    }
  }
  return schema
}

const ponderSchema = setDatabaseSchema(_ponderSchema, process.env.DATABASE_SCHEMA!)

export const profileRelations = relations(offchainSchema.profile, ({ one }) => ({
  account: one(ponderSchema.account, {
    fields: [offchainSchema.profile.address],
    references: [ponderSchema.account.address],
  }),
}))

export const accountRelations = relations(ponderSchema.account, ({ one }) => ({
  profile: one(offchainSchema.profile, {
    // @ts-ignore
    fields: [ponderSchema.account.address],
    references: [offchainSchema.profile.address],
  }),
}))

export const schema = {
  ...offchainSchema,
  ...ponderSchema,
  profileRelations,
}
