import { relations } from 'drizzle-orm'
import * as offchainSchema from './offchain'

// For drizzle-kit, we only expose the offchain schema
// This allows drizzle-kit to only generate migrations for offchain tables
export const { profile } = offchainSchema

export const profileRelations = relations(offchainSchema.profile, ({ one }) => ({
  account: one(profile, {
    fields: [offchainSchema.profile.address],
    references: [offchainSchema.profile.address], // Self-reference as placeholder
  }),
}))

export const schema = {
  ...offchainSchema,
  profileRelations,
}
