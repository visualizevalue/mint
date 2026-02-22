import { countDistinct, eq, gte, sql, sum } from 'drizzle-orm'
import { artifact, collection, mint } from 'ponder:schema'

export async function getProtocolStats(db: any, { since }: { since?: number }) {
  const whereClause = since ? gte(mint.timestamp, BigInt(since)) : undefined

  const [mintStats, artistStats] = await Promise.all([
    db.select({
      totalCollections: countDistinct(mint.collection),
      totalArtifacts: sql<number>`count(distinct (${mint.collection}, ${mint.artifact}))`,
      totalMints: sum(mint.amount),
      totalVolume: sum(mint.price),
      totalGas: sum(mint.gas_fee),
      uniqueCollectors: countDistinct(mint.account),
    }).from(mint).where(whereClause),

    db.select({
      uniqueArtists: countDistinct(collection.artist),
    }).from(mint)
      .innerJoin(collection, eq(mint.collection, collection.address))
      .where(whereClause),
  ])

  return {
    totalCollections: mintStats[0].totalCollections,
    totalArtifacts: Number(mintStats[0].totalArtifacts || 0),
    totalMints: Number(mintStats[0].totalMints || 0),
    totalVolume: (mintStats[0].totalVolume || '0').toString(),
    totalGas: (mintStats[0].totalGas || '0').toString(),
    uniqueArtists: artistStats[0].uniqueArtists,
    uniqueCollectors: mintStats[0].uniqueCollectors,
  }
}

export async function getActivity(
  db: any,
  { since, granularity }: { since?: number; granularity: 'daily' | 'weekly' },
) {
  const interval = granularity === 'weekly' ? 'week' : 'day'
  const bucket = sql`date_trunc(${sql.raw(`'${interval}'`)}, to_timestamp(${mint.timestamp}::double precision))`

  const rows = await db.select({
    date: sql<string>`to_char(${bucket}, 'YYYY-MM-DD')`,
    count: sum(mint.amount),
    volume: sum(mint.price),
    avgGas: sql<string>`avg(${mint.gas_price})`,
    avgUnitPrice: sql<string>`avg(${mint.unit_price})`,
  })
    .from(mint)
    .where(since ? gte(mint.timestamp, BigInt(since)) : undefined)
    .groupBy(bucket)
    .orderBy(bucket)

  return rows.map((r: any) => ({
    date: r.date,
    count: Number(r.count || 0),
    volume: Number(r.volume || 0) / 1e18,
    avgGasGwei: Number(r.avgGas || 0) / 1e9,
    avgUnitPrice: Number(r.avgUnitPrice || 0) / 1e18,
  }))
}

export async function getArtifactCreations(
  db: any,
  { since, granularity }: { since?: number; granularity: 'daily' | 'weekly' },
) {
  const interval = granularity === 'weekly' ? 'week' : 'day'
  const bucket = sql`date_trunc(${sql.raw(`'${interval}'`)}, to_timestamp(${artifact.created_at}::double precision))`

  const rows = await db.select({
    date: sql<string>`to_char(${bucket}, 'YYYY-MM-DD')`,
    count: sql<number>`count(*)`,
  })
    .from(artifact)
    .where(since ? gte(artifact.created_at, BigInt(since)) : undefined)
    .groupBy(bucket)
    .orderBy(bucket)

  return rows.map((r: any) => ({
    date: r.date,
    count: Number(r.count || 0),
  }))
}

export async function getCollectionCreations(
  db: any,
  { since, granularity }: { since?: number; granularity: 'daily' | 'weekly' },
) {
  const interval = granularity === 'weekly' ? 'week' : 'day'
  const bucket = sql`date_trunc(${sql.raw(`'${interval}'`)}, to_timestamp(${collection.created_at}::double precision))`

  const rows = await db.select({
    date: sql<string>`to_char(${bucket}, 'YYYY-MM-DD')`,
    count: sql<number>`count(*)`,
  })
    .from(collection)
    .where(since ? gte(collection.created_at, BigInt(since)) : undefined)
    .groupBy(bucket)
    .orderBy(bucket)

  return rows.map((r: any) => ({
    date: r.date,
    count: Number(r.count || 0),
  }))
}

export async function getTopSpenders(
  db: any,
  { since, limit = 500 }: { since?: number; limit?: number },
) {
  const rows = await db.select({
    address: mint.account,
    spent: sum(mint.price),
    gasSpent: sum(mint.gas_fee),
    mintCount: sum(mint.amount),
  })
    .from(mint)
    .where(since ? gte(mint.timestamp, BigInt(since)) : undefined)
    .groupBy(mint.account)
    .orderBy(sql`sum(${mint.price}) desc`)
    .limit(limit)

  return rows.map((r: any) => ({
    address: r.address,
    spent: Number(r.spent || 0) / 1e18,
    gasSpent: Number(r.gasSpent || 0) / 1e18,
    mintCount: Number(r.mintCount || 0),
  }))
}

export async function getTopEarners(
  db: any,
  { since, limit = 500 }: { since?: number; limit?: number },
) {
  const rows = await db.select({
    address: collection.artist,
    earned: sum(mint.price),
    mintCount: sum(mint.amount),
    uniqueCollectors: countDistinct(mint.account),
  })
    .from(mint)
    .innerJoin(collection, eq(mint.collection, collection.address))
    .where(since ? gte(mint.timestamp, BigInt(since)) : undefined)
    .groupBy(collection.artist)
    .orderBy(sql`sum(${mint.price}) desc`)
    .limit(limit)

  return rows.map((r: any) => ({
    address: r.address,
    earned: Number(r.earned || 0) / 1e18,
    mintCount: Number(r.mintCount || 0),
    uniqueCollectors: r.uniqueCollectors,
  }))
}
