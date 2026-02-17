import { and, countDistinct, eq, gt, sql, sum } from 'drizzle-orm'
import { artifact, mint, ownership } from 'ponder:schema'

export async function getArtifactStats(
  db: any,
  { address, id }: { address: string; id: string },
) {
  const addr = address.toLowerCase() as `0x${string}`
  const tokenId = BigInt(id)

  const exists = await db.select({ id: artifact.id })
    .from(artifact)
    .where(and(eq(artifact.collection, addr), eq(artifact.id, tokenId)))
    .limit(1)

  if (!exists[0]) return null

  const [
    mintAgg,
    holderCount,
    topHolders,
    topMinters,
    activity,
  ] = await Promise.all([
    db.select({
      totalMints: sum(mint.amount),
      totalVolume: sum(mint.price),
      uniqueMinters: countDistinct(mint.account),
    })
      .from(mint)
      .where(and(eq(mint.collection, addr), eq(mint.artifact, tokenId))),

    db.select({
      count: countDistinct(ownership.account),
    })
      .from(ownership)
      .where(and(
        eq(ownership.collection, addr),
        eq(ownership.artifact, tokenId),
        gt(ownership.balance, 0n),
      )),

    db.select({
      address: ownership.account,
      balance: ownership.balance,
    })
      .from(ownership)
      .where(and(
        eq(ownership.collection, addr),
        eq(ownership.artifact, tokenId),
        gt(ownership.balance, 0n),
      ))
      .orderBy(sql`${ownership.balance} desc`)
      .limit(10),

    db.select({
      address: mint.account,
      spent: sum(mint.price),
      mintCount: sum(mint.amount),
    })
      .from(mint)
      .where(and(eq(mint.collection, addr), eq(mint.artifact, tokenId)))
      .groupBy(mint.account)
      .orderBy(sql`sum(${mint.price}) desc`),

    db.select({
      date: sql<string>`to_char(date_trunc('day', to_timestamp(${mint.timestamp}::double precision)), 'YYYY-MM-DD')`,
      count: sum(mint.amount),
      volume: sum(mint.price),
    })
      .from(mint)
      .where(and(eq(mint.collection, addr), eq(mint.artifact, tokenId)))
      .groupBy(sql`date_trunc('day', to_timestamp(${mint.timestamp}::double precision))`)
      .orderBy(sql`date_trunc('day', to_timestamp(${mint.timestamp}::double precision))`),
  ])

  return {
    stats: {
      totalMints: Number(mintAgg[0].totalMints || 0),
      totalVolume: Number(mintAgg[0].totalVolume || 0) / 1e18,
      uniqueMinters: mintAgg[0].uniqueMinters,
      uniqueHolders: holderCount[0].count,
    },
    topHolders: topHolders.map((r: any) => ({
      address: r.address,
      balance: Number(r.balance || 0),
    })),
    topMinters: topMinters.map((r: any) => ({
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
