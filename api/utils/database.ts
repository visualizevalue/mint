import { zeroAddress } from 'viem'
import { normalize } from 'viem/ens'
import { account, artifact, collection, profile, ownership, transfer } from '../ponder.schema'
import { publicClient } from './client'
import { parseJson } from './json'
import { ONE_DAY, nowInSeconds } from './time'

export async function getAccount (address, { client, db }) {
  let data = await db.find(account, { address })

  if (! data) {
    data = await db.insert(account).values({ address, ens_updated_at: 0n }).onConflictDoNothing()
  }

  const now = nowInSeconds()
  if (! data.ens || data.ens_updated_at + ONE_DAY < now) {
    const ens = await client.getEnsName({ address })

    data = await db.update(account, { address }).set({ ens, ens_updated_at: now })
  }

  return data
}

export async function getCollection (address, { db }) {
  let data = await db.find(collection, { address })

  if (! data) {
    data = await db.insert(collection).values({ address }).onConflictDoNothing()
  }

  return data
}

export async function getArtifact (collection, id, context) {
  let data = await context.db.find(artifact, { collection, id })

  if (! data) {
    data = await createArtifact(collection, id, context)
  }

  return data
}

export async function createArtifact (collection, id, { client, db, contracts }) {
  let metadata = {
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
    const data = parseJson(json)
    Object.keys(data).forEach(key => {
      metadata[key] = data[key]
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

export async function saveProfile (ens, { db }) {
  if (! ens) return

  try {
    const [avatar, description, url, email, twitter, github] = await Promise.all([
      publicClient.getEnsAvatar({ name: normalize(ens) }),
      publicClient.getEnsText({ name: ens, key: 'description' }),
      publicClient.getEnsText({ name: ens, key: 'url' }),
      publicClient.getEnsText({ name: ens, key: 'email' }),
      publicClient.getEnsText({ name: ens, key: 'com.twitter' }),
      publicClient.getEnsText({ name: ens, key: 'com.github' }),
    ])

    const data = {
      avatar: avatar || '',
      description: description || '',
      links: {
        url,
        email,
        twitter,
        github,
      },
      updated_at: BigInt(Date.now()),
    }

    await db.insert(profile).values({ ens, ...data }).onConflictDoUpdate(data)
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
  },
  context
) => {
  const { client, db } = context

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
    await db.update(artifact, { collection: address, id })
            .set((row) => ({ supply: row.supply + amount }))

    await db.update(collection, { address })
            .set((row) => ({ total_supply: row.total_supply + amount }))
  }

  // New Burn - Decrease the token supply
  if (to === zeroAddress) {
    await db.update(artifact, { collection: address, id })
            .set((row) => ({ supply: row.supply - amount }))

    await db.update(collection, { address })
            .set((row) => ({ total_supply: row.total_supply - amount }))
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
      .onConflictDoUpdate((row) => ({ balance: row.balance += amount }))
  }

  // Subtract the balance from the sender
  if (from !== zeroAddress) {
    await db.update(ownership, { account: from, collection: address, artifact: id })
            .set((row) => ({ balance: row.balance -= amount }))
  }
}

