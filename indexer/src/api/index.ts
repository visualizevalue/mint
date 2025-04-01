import { drizzle } from 'drizzle-orm/node-postgres'
import { Hono } from 'hono'
import { client, graphql } from 'ponder'
import { db } from 'ponder:api'
import schema from 'ponder:schema'
import { getProfile } from './profiles'
import * as offchainSchema from '../offchain/schema'

const offchainDb = drizzle(process.env.DATABASE_URL!, {
  schema: offchainSchema,
})

const app = new Hono()

app.use('/sql/*', client({ db, schema }))

app.use('/', graphql({ db, schema }))
app.use('/extended-graphql', graphql({ db: offchainDb, schema: offchainSchema }))

app.get('/profiles/:address', getProfile)

export default app
