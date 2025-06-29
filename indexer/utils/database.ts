import { zeroAddress } from 'viem'
import { IndexingFunctionArgs, type Context } from 'ponder:registry'
import { account, artifact, collection, ownership, transfer } from 'ponder:schema'
import { parseJson } from './json'
import { Metadata } from './types'

export async function getAccount(address: `0x${string}`, { db }: Context) {
  return await db.insert(account).values({ address }).onConflictDoNothing()
}

export async function getCollection(
  address: `0x${string}`,
  { context: { db } }: IndexingFunctionArgs<'Mint:TransferSingle'>,
) {
  let data = await db.find(collection, { address })

  if (!data) {
    data = await db
      .insert(collection)
      .values({
        address,
      })
      .onConflictDoNothing()
  }

  return data
}

export async function getArtifact(
  collection: `0x${string}`,
  id: bigint,
  { event, context }: IndexingFunctionArgs<'Mint:TransferSingle'>,
) {
  let data = await context.db.find(artifact, { collection, id })

  if (!data) {
    data = await createArtifact(
      collection,
      id,
      event.block.timestamp,
      event.block.number,
      context,
    )
  }

  return data
}

export async function createArtifact(
  address: `0x${string}`,
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
      address,
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

  // Update the collection
  await db
    .insert(collection)
    .values({
      address,
    })
    .onConflictDoUpdate((row) => ({
      updated_at: timestamp,
      latest_token_id: (row.latest_token_id || 0n) + 1n,
    }))

  // Store artifact
  return await db
    .insert(artifact)
    .values({
      collection: address,
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
        created_at: timestamp,
        updated_at: timestamp,
      })
      .onConflictDoUpdate((row: typeof ownership.$inferInsert) => ({
        balance: (row.balance ?? 0n) + amount,
        updated_at: timestamp,
      }))
  }

  // Subtract the balance from the sender
  if (from !== zeroAddress) {
    await db
      .insert(ownership)
      .values({
        collection: address,
        account: from,
        artifact: id,
        balance: 0n,
        created_at: timestamp,
        updated_at: timestamp,
      })
      .onConflictDoUpdate((row: typeof ownership.$inferInsert) => ({
        balance: (row.balance ?? 0n) - amount,
        updated_at: timestamp,
      }))
  }
}
