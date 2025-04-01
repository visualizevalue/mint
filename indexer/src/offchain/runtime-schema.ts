import { Table, is, relations } from 'drizzle-orm'
import * as _ponderSchema from '../../ponder.schema'
import * as offchainSchema from './offchain'

// This file is for runtime use, not for drizzle-kit migrations
// It properly merges the ponder schema with the offchain schema

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

// At runtime, we'll have access to the DATABASE_SCHEMA env variable
const ponderSchema = setDatabaseSchema(_ponderSchema, process.env.DATABASE_SCHEMA!)

// Define relations between offchain and ponder schemas
export const profileRelations = relations(offchainSchema.profile, ({ one }) => ({
  account: one(ponderSchema.account, {
    fields: [offchainSchema.profile.address],
    references: [ponderSchema.account.address],
  }),
}))

export const accountRelations = relations(ponderSchema.account, ({ one }) => ({
  profile: one(offchainSchema.profile, {
    fields: [ponderSchema.account.address],
    references: [offchainSchema.profile.address],
  }),
}))

// Export the complete merged schema for runtime use
export const runtimeSchema = {
  ...offchainSchema,
  ...ponderSchema,
  profileRelations,
  accountRelations,
}