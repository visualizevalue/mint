import { and, count, countDistinct, eq, gt, sql, sum } from 'drizzle-orm'
import { artifact, collection, mint, ownership } from 'ponder:schema'

export async function getCollectionStats(
  db: any,
  { address }: { address: string },
) {
  const addr = address.toLowerCase() as `0x${string}`

  const exists = await db.select({ address: collection.address })
    .from(collection)
    .where(eq(collection.address, addr))
    .limit(1)

  if (!exists[0]) return null

  const [
    mintAgg,
    holderCount,
    artifactCount,
    topHolders,
    topCollectors,
    activity,
  ] = await Promise.all([
    db.select({
      totalMints: sum(mint.amount),
      totalVolume: sum(mint.price),
      uniqueCollectors: countDistinct(mint.account),
    })
      .from(mint)
      .where(eq(mint.collection, addr)),

    db.select({
      count: countDistinct(ownership.account),
    })
      .from(ownership)
      .where(and(eq(ownership.collection, addr), gt(ownership.balance, 0n))),

    db.select({
      count: count(),
    })
      .from(artifact)
      .where(eq(artifact.collection, addr)),

    db.select({
      address: ownership.account,
      balance: sum(ownership.balance),
    })
      .from(ownership)
      .where(and(eq(ownership.collection, addr), gt(ownership.balance, 0n)))
      .groupBy(ownership.account)
      .orderBy(sql`sum(${ownership.balance}) desc`)
      .limit(10),

    db.select({
      address: mint.account,
      spent: sum(mint.price),
      mintCount: sum(mint.amount),
    })
      .from(mint)
      .where(eq(mint.collection, addr))
      .groupBy(mint.account)
      .orderBy(sql`sum(${mint.price}) desc`),

    db.select({
      date: sql<string>`to_char(date_trunc('day', to_timestamp(${mint.timestamp}::double precision)), 'YYYY-MM-DD')`,
      count: sum(mint.amount),
      volume: sum(mint.price),
    })
      .from(mint)
      .where(eq(mint.collection, addr))
      .groupBy(sql`date_trunc('day', to_timestamp(${mint.timestamp}::double precision))`)
      .orderBy(sql`date_trunc('day', to_timestamp(${mint.timestamp}::double precision))`),
  ])

  return {
    stats: {
      totalMints: Number(mintAgg[0].totalMints || 0),
      totalVolume: Number(mintAgg[0].totalVolume || 0) / 1e18,
      uniqueCollectors: mintAgg[0].uniqueCollectors,
      uniqueHolders: holderCount[0].count,
      artifactCount: artifactCount[0].count,
    },
    topHolders: topHolders.map((r: any) => ({
      address: r.address,
      balance: Number(r.balance || 0),
    })),
    topCollectors: topCollectors.map((r: any) => ({
      address: r.address,
      spent: Number(r.spent || 0) / 1e18,
      mintCount: Number(r.mintCount || 0),
    })),
    activity: activity.map((r: any) => ({
      date: r.date,
      count: Number(r.count || 0),
      volume: Number(r.volume || 0) / 1e18,
    })),
  }
}
