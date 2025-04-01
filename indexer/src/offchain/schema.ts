import { relations } from 'drizzle-orm'
import * as offchainSchema from './offchain'

// Note: We need a separate file for merging the schemas because
// "ponder.schema" can't be executed by drizzle-kit, and we also
// don't want drizzle to generate migrations for onchain tables.

// For drizzle-kit, we only expose the offchain schema
// This allows drizzle-kit to only generate migrations for offchain tables
export const { profile } = offchainSchema

// The relations are defined here but not directly exposed to drizzle-kit
// When using the database at runtime, we'll use a merged schema
export const profileRelations = relations(offchainSchema.profile, ({ one }) => ({
  // This is a placeholder for runtime. At migration time, this won't be used
  account: one(profile, {
    fields: [offchainSchema.profile.address],
    references: [offchainSchema.profile.address], // Self-reference as placeholder
  }),
}))

// Export for drizzle-kit migrations
export const schema = {
  ...offchainSchema,
  profileRelations,
}
