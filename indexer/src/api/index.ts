import { Hono } from 'hono'
import { client, graphql } from 'ponder'
import { db as ponderDb } from 'ponder:api'
import schema from 'ponder:schema'
import { getProfile } from './profiles'

const app = new Hono()

// Default SQL and GraphQL endpoints for Ponder schema
app.use('/sql/*', client({ db: ponderDb, schema }))
app.use('/', graphql({ db: ponderDb, schema }))

// // Extended GraphQL endpoint with merged schema
// app.use('/', graphql({ db: offchainDb, schema: runtimeSchema }))

// Profile endpoint
app.get('/profiles/:address', getProfile)

export default app
