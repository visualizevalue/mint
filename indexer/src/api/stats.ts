import { Hono } from 'hono'
import { db } from 'ponder:api'
import { getProtocolStats, getActivity, getArtifactCreations, getCollectionCreations, getTopSpenders, getTopEarners } from '../services/stats/protocol'
import { getCollectionStats } from '../services/stats/collection'
import { getArtifactStats } from '../services/stats/artifact'
import { getAddressStats } from '../services/stats/address'
import { search } from '../services/stats/search'

const stats = new Hono()

stats.get('/search', async (c) => {
  const q = c.req.query('q') || ''
  return c.json(await search(db, { q }))
})

stats.get('/', async (c) => {
  const since = c.req.query('since') ? Number(c.req.query('since')) : undefined
  const granularity = c.req.query('granularity') === 'weekly' ? 'weekly' as const : 'daily' as const

  const [stats, activity, artifactCreations, collectionCreations, topSpenders, topEarners] = await Promise.all([
    getProtocolStats(db, { since }),
    getActivity(db, { since, granularity }),
    getArtifactCreations(db, { since, granularity }),
    getCollectionCreations(db, { since, granularity }),
    getTopSpenders(db, { since }),
    getTopEarners(db, { since }),
  ])

  return c.json({ stats, activity, artifactCreations, collectionCreations, topSpenders, topEarners })
})

stats.get('/:address', async (c) => {
  const address = c.req.param('address')

  const collectionData = await getCollectionStats(db, { address })
  if (collectionData) return c.json({ type: 'collection', ...collectionData })

  return c.json({ type: 'address', ...await getAddressStats(db, { address }) })
})

stats.get('/:address/:id', async (c) => {
  const address = c.req.param('address')
  const id = c.req.param('id')
  const data = await getArtifactStats(db, { address, id })
  if (!data) return c.json({ error: 'Artifact not found' }, 404)
  return c.json(data)
})

export default stats
