import { zeroAddress } from 'viem'
import { normalize } from 'viem/ens'
import { type Context, type Event } from 'ponder:registry'
import { account, artifact, collection, profile, ownership, transfer } from 'ponder:schema'
import { parseJson } from './json'
import { ONE_DAY, nowInSeconds } from './time'
import { Metadata } from './types'

export async function getAccount(
  address: `0x${string}`,
  { client, db }: Context,
  { fetch_ens } = { fetch_ens: false },
) {
  let data = await db
    .insert(account)
    .values({ address, ens: '', ens_updated_at: 0n })
    .onConflictDoNothing()

  if (!fetch_ens) return data
  if (!data) return data

  const now = nowInSeconds()
  if ((data.ens_updated_at || 0n) + ONE_DAY < now) {
    try {
      const ens = (await client.getEnsName({ address })) || ''

      data = await db.update(account, { address }).set({ ens, ens_updated_at: now })
    } catch (e) {
      console.warn(`Ran into an issue fetching/saving the ENS record for ${address}`)
    }
  } else {
    console.info(`Skip ens update: ${address}, ${data.ens}`)
  }

  return data
}

export async function getCollection(address: `0x${string}`, { db }: Context) {
  let data = await db.find(collection, { address })

  if (!data) {
    data = await db.insert(collection).values({ address }).onConflictDoNothing()
  }

  return data
}

export async function getArtifact(collection: `0x${string}`, id: bigint, context: Context) {
  let data = await context.db.find(artifact, { collection, id })

  if (!data) {
    data = await createArtifact(collection, id, context)
  }

  return data
}

export async function createArtifact(
  collection: `0x${string}`,
  id: bigint,
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
    })
    .onConflictDoNothing()
}

export async function saveProfile(ens: string, { client, db }: Context) {
  if (!ens) return

  try {
    const [avatar, description, url, email, twitter, github] = await Promise.all([
      client.getEnsAvatar({ name: normalize(ens) }),
      client.getEnsText({ name: ens, key: 'description' }),
      client.getEnsText({ name: ens, key: 'url' }),
      client.getEnsText({ name: ens, key: 'email' }),
      client.getEnsText({ name: ens, key: 'com.twitter' }),
      client.getEnsText({ name: ens, key: 'com.github' }),
    ])

    const data = {
      avatar: avatar || '',
      description: description || '',
      links: {
        url: url || '',
        email: email || '',
        twitter: twitter || '',
        github: github || '',
      },
      updated_at: BigInt(Date.now()),
    }

    await db
      .insert(profile)
      .values({ ens, ...data })
      .onConflictDoUpdate(data)
  } catch (e) {
    console.warn(`Error fetching profile:`, e)
  }
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
