import { Hono } from 'hono'
import { client, graphql } from 'ponder'
import { db as ponderDb } from 'ponder:api'
import schema from 'ponder:schema'
import { getProfile, forceUpdateProfile } from './profiles'
import stats from './stats'

const app = new Hono()

// Default SQL and GraphQL endpoints for Ponder schema
app.use('/sql/*', client({ db: ponderDb, schema }))
app.use('/', graphql({ db: ponderDb, schema }))

// // Extended GraphQL endpoint with merged schema
// TODO: Would be nice to merge the schemas and enable this via graphql
// app.use('/', graphql({ db: offchainDb, schema: runtimeSchema }))

// Stats endpoints
app.route('/stats', stats)

// Profile endpoints
app.get('/profiles/:id', getProfile)
app.post('/profiles/:id', forceUpdateProfile)

export default app
