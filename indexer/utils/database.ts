import { zeroAddress } from 'viem'
import { type Context } from 'ponder:registry'
import { account, artifact, collection, ownership, transfer } from 'ponder:schema'
import { parseJson } from './json'
import { Metadata } from './types'

export async function getAccount(address: `0x${string}`, { db }: Context) {
  return await db.insert(account).values({ address }).onConflictDoNothing()
}

export async function getCollection(address: `0x${string}`, { db }: Context) {
  let data = await db.find(collection, { address })

  if (!data) {
    data = await db.insert(collection).values({ address }).onConflictDoNothing()
  }

  return data
}

export async function getArtifact(
  collection: `0x${string}`,
  id: bigint,
  timestamp: bigint,
  block: bigint,
  context: Context,
) {
  let data = await context.db.find(artifact, { collection, id })

  if (!data) {
    data = await createArtifact(collection, id, timestamp, block, context)
  }

  return data
}

export async function createArtifact(
  collection: `0x${string}`,
  id: bigint,
  timestamp: bigint,
  block: bigint,
  { client, db, contracts }: Context,
) {
  let metadata: Metadata = {
    name: '',
    description: '',
    image: '',
    animation_url: '',
  }
  try {
    const uri = await client.readContract({
      abi: contracts.Mint.abi,
      address: collection,
      functionName: 'uri',
      args: [id],
    })

    const json = Buffer.from(uri.substring(29), `base64`).toString()
    const data: Metadata = parseJson<Metadata>(json) || metadata
    const keys = Object.keys(metadata) as (keyof Metadata)[]
    keys.forEach((key) => {
      metadata[key] = data[key] as string
    })
  } catch (e) {
    console.warn(`Fetching metadata for ${collection}:${id} failed.`, e)
  }

  // Store artifact
  return await db
    .insert(artifact)
    .values({
      collection,
      id,
      ...metadata,
      supply: 0n,
      created_block: block,
      created_at: timestamp,
    })
    .onConflictDoNothing()
}

export const computeTransfer = async (
  {
    address,
    id,
    hash,
    block_number,
    log_index,
    timestamp,
    from,
    to,
    amount,
  }: {
    address: `0x${string}`
    id: bigint
    hash: `0x${string}`
    block_number: bigint
    log_index: number
    timestamp: bigint
    from: `0x${string}`
    to: `0x${string}`
    amount: bigint
  },
  { db }: Context,
) => {
  // Store the Transfer
  await db
    .insert(transfer)
    .values({
      collection: address,
      artifact: id,
      hash,
      block_number,
      log_index,
      timestamp,
      amount,
      from,
      to,
    })
    .onConflictDoNothing()

  // New Mint - Increase the token supply
  if (from === zeroAddress) {
    await db
      .update(artifact, { collection: address, id })
      .set((row: typeof artifact.$inferSelect) => ({ supply: (row.supply ?? 0n) + amount }))

    await db.update(collection, { address }).set((row: typeof collection.$inferSelect) => ({
      total_supply: (row.total_supply ?? 0n) + amount,
    }))
  }

  // New Burn - Decrease the token supply
  if (to === zeroAddress) {
    await db
      .update(artifact, { collection: address, id })
      .set((row: typeof artifact.$inferSelect) => ({ supply: (row.supply ?? 0n) - amount }))

    await db.update(collection, { address }).set((row: typeof collection.$inferSelect) => ({
      total_supply: (row.total_supply ?? 0n) - amount,
    }))
  }

  // Add the balance to the recipient
  if (to !== zeroAddress) {
    await db
      .insert(ownership)
      .values({
        collection: address,
        account: to,
        artifact: id,
        balance: amount,
      })
      .onConflictDoUpdate((row: typeof ownership.$inferInsert) => ({
        balance: (row.balance ?? 0n) + amount,
      }))
  }

  // Subtract the balance from the sender
  if (from !== zeroAddress) {
    await db
      .update(ownership, { account: from, collection: address, artifact: id })
      .set((row: typeof ownership.$inferSelect) => ({ balance: (row.balance ?? 0n) - amount }))
  }
}
