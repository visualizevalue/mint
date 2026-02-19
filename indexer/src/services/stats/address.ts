import { count, countDistinct, eq, sql, sum } from 'drizzle-orm'
import { collection, mint, ownership } from 'ponder:schema'

export async function getAddressStats(
  db: any,
  { address }: { address: string },
) {
  const addr = address.toLowerCase() as `0x${string}`

  const [
    collectorAgg,
    tokensHeldAgg,
    artistCollAgg,
    topArtists,
    artistMintAgg,
    topCollectors,
    artistCollections,
  ] = await Promise.all([
    db.select({
      totalSpent: sum(mint.price),
      totalGas: sum(mint.gas_fee),
      mintCount: sum(mint.amount),
      collectionsCount: countDistinct(mint.collection),
    })
      .from(mint)
      .where(eq(mint.account, addr)),

    db.select({
      tokens: sum(ownership.balance),
    })
      .from(ownership)
      .where(eq(ownership.account, addr)),

    db.select({
      collectionsCount: count(),
      totalSupply: sum(collection.total_supply),
    })
      .from(collection)
      .where(eq(collection.artist, addr)),

    db.select({
      address: collection.artist,
      spent: sum(mint.price),
      mintCount: sum(mint.amount),
    })
      .from(mint)
      .innerJoin(collection, eq(mint.collection, collection.address))
      .where(eq(mint.account, addr))
      .groupBy(collection.artist)
      .orderBy(sql`sum(${mint.price}) desc`)
      .limit(10),

    db.select({
      totalEarned: sum(mint.price),
      mintCount: sum(mint.amount),
      uniqueCollectors: countDistinct(mint.account),
    })
      .from(mint)
      .innerJoin(collection, eq(mint.collection, collection.address))
      .where(eq(collection.artist, addr)),

    db.select({
      address: mint.account,
      spent: sum(mint.price),
      mintCount: sum(mint.amount),
    })
      .from(mint)
      .innerJoin(collection, eq(mint.collection, collection.address))
      .where(eq(collection.artist, addr))
      .groupBy(mint.account)
      .orderBy(sql`sum(${mint.price}) desc`)
      .limit(10),

    db.select({
      address: collection.address,
      name: collection.name,
      symbol: collection.symbol,
      totalSupply: collection.total_supply,
      latestTokenId: collection.latest_token_id,
    })
      .from(collection)
      .where(eq(collection.artist, addr))
      .orderBy(sql`${collection.total_supply} desc`),
  ])

  const collectionAddresses = artistCollections.map((c: any) => c.address)
  let volumeMap = new Map<string, number>()
  let holderMap = new Map<string, number>()

  if (collectionAddresses.length) {
    const [volumes, holders] = await Promise.all([
      db.select({
        collection: mint.collection,
        volume: sum(mint.price),
      })
        .from(mint)
        .where(sql`${mint.collection} in (${sql.join(collectionAddresses.map((a: string) => sql`${a}`), sql`, `)})`)
        .groupBy(mint.collection),

      db.select({
        collection: ownership.collection,
        holders: countDistinct(ownership.account),
      })
        .from(ownership)
        .where(sql`${ownership.collection} in (${sql.join(collectionAddresses.map((a: string) => sql`${a}`), sql`, `)}) and ${ownership.balance} > 0`)
        .groupBy(ownership.collection),
    ])

    volumeMap = new Map(volumes.map((r: any) => [r.collection, Number(r.volume || 0) / 1e18]))
    holderMap = new Map(holders.map((r: any) => [r.collection, r.holders]))
  }

  return {
    collector: {
      totalSpent: Number(collectorAgg[0].totalSpent || 0) / 1e18,
      totalGas: Number(collectorAgg[0].totalGas || 0) / 1e18,
      mintCount: Number(collectorAgg[0].mintCount || 0),
      collectionsCount: collectorAgg[0].collectionsCount,
      tokensHeld: Number(tokensHeldAgg[0].tokens || 0),
      topArtists: topArtists.map((r: any) => ({
        address: r.address,
        spent: Number(r.spent || 0) / 1e18,
        mintCount: Number(r.mintCount || 0),
      })),
    },
    artist: {
      totalEarned: Number(artistMintAgg[0].totalEarned || 0) / 1e18,
      mintCount: Number(artistMintAgg[0].mintCount || 0),
      uniqueCollectors: artistMintAgg[0].uniqueCollectors,
      collectionsCount: artistCollAgg[0].collectionsCount,
      totalSupply: Number(artistCollAgg[0].totalSupply || 0),
      topCollectors: topCollectors.map((r: any) => ({
        address: r.address,
        spent: Number(r.spent || 0) / 1e18,
        mintCount: Number(r.mintCount || 0),
      })),
      collections: artistCollections.map((c: any) => ({
        address: c.address,
        name: c.name || c.symbol,
        totalSupply: Number(c.totalSupply || 0),
        artifactCount: Number(c.latestTokenId || 0),
        volume: volumeMap.get(c.address) || 0,
        holders: holderMap.get(c.address) || 0,
      })),
    },
  }
}
