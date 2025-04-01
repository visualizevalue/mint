import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { runtimeSchema } from './runtime-schema'

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Create a drizzle instance with the runtime schema
export const db = drizzle(pool, { schema: runtimeSchema })

// Export the profile table for convenience
export { profile } from './offchain'

// Example query (commented out for production use)
/*
const result = await db.query.profile.findMany({
  with: {
    account: true,
  },
})
console.log(result)
*/
