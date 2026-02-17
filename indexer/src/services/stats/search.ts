import { sql } from 'drizzle-orm'
import { artifact, collection } from 'ponder:schema'

export async function search(
  db: any,
  { q }: { q: string },
) {
  if (!q || q.length < 2) return { results: [] }

  const term = `%${q.toLowerCase()}%`
  const results: any[] = []

  const [collections, artifacts] = await Promise.all([
    db.select({
      address: collection.address,
      name: collection.name,
      symbol: collection.symbol,
      artist: collection.artist,
    })
      .from(collection)
      .where(sql`(lower(${collection.name}) like ${term} or lower(${collection.symbol}) like ${term})`)
      .limit(10),

    db.select({
      id: artifact.id,
      name: artifact.name,
      collection: artifact.collection,
    })
      .from(artifact)
      .where(sql`lower(${artifact.name}) like ${term}`)
      .limit(10),
  ])

  for (const c of collections) {
    results.push({
      type: 'collection',
      address: c.address,
      name: c.name || c.symbol,
      artist: c.artist,
    })
  }

  for (const a of artifacts) {
    results.push({
      type: 'artifact',
      id: Number(a.id),
      name: a.name,
      collection: a.collection,
    })
  }

  return { results }
}
