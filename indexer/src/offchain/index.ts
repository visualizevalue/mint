import { drizzle } from 'drizzle-orm/node-postgres'
import { schema } from './schema'

export const db = drizzle(process.env.DATABASE_URL!, { schema })

const result = await db.query.profile.findMany({
  with: {
    account: true,
  },
})

console.log(result)
