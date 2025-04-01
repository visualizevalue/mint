import { publicClients } from 'ponder:api'
import { eq } from 'drizzle-orm'
import { normalize } from 'viem/ens'
import { type Context } from 'hono'
import { db } from '../offchain'
import { profile } from '../offchain/schema'
import { ONE_MONTH } from '../../utils/time'

const client = publicClients[1]

/**
 * API endpoint to retrieve profile information for an Ethereum address.
 * Returns cached profile if available and not older than a month,
 * otherwise fetches fresh data from ENS.
 *
 * TODO: Consider reverting if account has never interacted with mint
 */
export const getProfile = async (c: Context) => {
  const address = c.req.param('address') as `0x${string}`

  // First check if we have a profile in the offchain database
  let cachedProfile = await fetchProfile(address)

  // Check if profile exists and is not older than a month
  const useCached =
    cachedProfile &&
    cachedProfile.updated_at &&
    BigInt(Date.now() - new Date(cachedProfile.updated_at).getTime()) < ONE_MONTH

  // Return cached profile data if it exists and is fresh
  if (useCached) return c.json(cachedProfile)

  // Update our profile data (fetch from ENS)
  await updateProfile(address)

  // Fetch the updated profile
  return c.json(await fetchProfile(address))
}

/**
 * API endpoint to force update a profile regardless of cache status.
 * Fetches fresh data from ENS and updates the database.
 */
export const forceUpdateProfile = async (c: Context) => {
  const address = c.req.param('address') as `0x${string}`

  // Update the profile data (fetch from ENS)
  await updateProfile(address)

  // Fetch and return the updated profile
  return c.json(await fetchProfile(address))
}

/**
 * Retrieves a profile from the database by Ethereum address.
 */
const fetchProfile = async (address: `0x${string}`) =>
  await db.query.profile.findFirst({
    where: eq(profile.address, address),
  })

/**
 * Updates or creates a profile for an Ethereum address.
 * Fetches ENS data if available and stores it in the database.
 */
const updateProfile = async (address: `0x${string}`) => {
  const ens = (await client.getEnsName({ address })) || null

  // Fallback to fetching ENS data
  const data = {
    avatar: '',
    description: '',
    links: {
      url: '',
      email: '',
      twitter: '',
      github: '',
    },
  }

  if (ens) {
    const [avatar, description, url, email, twitter, github] = await Promise.all([
      client.getEnsAvatar({ name: normalize(ens) }),
      client.getEnsText({ name: ens, key: 'description' }),
      client.getEnsText({ name: ens, key: 'url' }),
      client.getEnsText({ name: ens, key: 'email' }),
      client.getEnsText({ name: ens, key: 'com.twitter' }),
      client.getEnsText({ name: ens, key: 'com.github' }),
    ])
    data.avatar = avatar || ''
    data.description = description || ''
    data.links.url = url || ''
    data.links.email = email || ''
    data.links.twitter = twitter || ''
    data.links.github = github || ''
  }

  // Store the profile in the offchain database for future requests
  const insertData = {
    ens,
    data,
    updated_at: new Date(),
  }
  await db
    .insert(profile)
    .values({
      address,
      ...insertData,
    })
    .onConflictDoUpdate({
      target: profile.address,
      set: insertData,
    })
}
