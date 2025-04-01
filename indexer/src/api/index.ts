import { db } from 'ponder:api'
import schema from 'ponder:schema'
import { Hono } from 'hono'
import { client, graphql } from 'ponder'
import { getProfile } from './profiles'

const app = new Hono()

app.use('/sql/*', client({ db, schema }))

app.use('/', graphql({ db, schema }))
app.use('/graphql', graphql({ db, schema }))

app.get('/profiles/:address', getProfile)

export default app
