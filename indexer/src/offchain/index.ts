import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

console.log(schema)

export const db = drizzle(process.env.DATABASE_URL!, { schema })
