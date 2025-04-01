import { eq, or } from 'drizzle-orm'
import { type Context } from 'hono'
import { isAddress } from 'viem'
import { normalize } from 'viem/ens'
import { publicClients } from 'ponder:api'
import { db } from '../offchain'
import { profile } from '../offchain/schema'
import { ONE_MONTH } from '../../utils/time'

const client = publicClients[1]

type ProfileResult = {
  address: `0x${string}` | null
  ensName: string | null
  cachedProfile: any | null
  isFresh: boolean
}

/**
 * API endpoint to retrieve profile information for an Ethereum address or ENS name.
 * Returns cached profile if available and not older than a month,
 * otherwise fetches fresh data from ENS.
 *
 * TODO: Consider reverting if account has never interacted with mint
 */
export const getProfile = async (c: Context) => {
  const result = await resolveProfile(c.req.param('id'))

  if (!result.address) {
    return c.json({ error: 'Invalid address or ENS name' }, 400)
  }

  // Return cached profile if it's fresh
  if (result.cachedProfile && result.isFresh) {
    return c.json(result.cachedProfile)
  }

  // Update profile data and return it
  await updateProfile(result.address, result.ensName)
  return c.json(await fetchProfile(result.address))
}

/**
 * API endpoint to force update a profile regardless of cache status.
 * Fetches fresh data from ENS and updates the database.
 */
export const forceUpdateProfile = async (c: Context) => {
  const result = await resolveProfile(c.req.param('id'))

  if (!result.address) {
    return c.json({ error: 'Invalid address or ENS name' }, 400)
  }

  // Update profile data and return it
  await updateProfile(result.address, result.ensName)
  return c.json(await fetchProfile(result.address))
}

/**
 * Combined function to resolve an identifier and check for cached profiles.
 * Returns all necessary data for the API endpoints in one operation.
 */
async function resolveProfile(identifier: string): Promise<ProfileResult> {
  if (!identifier) {
    return { address: null, ensName: null, cachedProfile: null, isFresh: false }
  }

  // For Ethereum addresses
  if (isAddress(identifier)) {
    const address = identifier as `0x${string}`
    const cachedProfile = await fetchProfile(address)

    // If we have a cached profile, extract ENS name and check freshness
    if (cachedProfile) {
      return {
        address,
        ensName: cachedProfile.ens,
        cachedProfile,
        isFresh: isFresh(cachedProfile.updated_at),
      }
    }

    // If no cached profile, look up ENS name on-chain
    const ensName = (await client.getEnsName({ address })) || null
    return { address, ensName, cachedProfile: null, isFresh: false }
  }

  // For ENS names
  try {
    // First check if we have this ENS name in the database
    const cachedProfile = await fetchProfile(identifier)

    if (cachedProfile) {
      return {
        address: cachedProfile.address as `0x${string}`,
        ensName: identifier,
        cachedProfile,
        isFresh: isFresh(cachedProfile.updated_at),
      }
    }

    // If no profile in database, resolve the ENS name on-chain
    const address = await client.getEnsAddress({
      name: normalize(identifier),
    })
    return { address, ensName: identifier, cachedProfile: null, isFresh: false }
  } catch (error) {
    return { address: null, ensName: null, cachedProfile: null, isFresh: false }
  }
}

/**
 * Checks if a timestamp is fresh (less than one month old).
 */
function isFresh(timestamp: Date | string | null): boolean {
  if (!timestamp) return false
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
  return Date.now() - date.getTime() < Number(ONE_MONTH)
}

/**
 * Retrieves a profile from the database by Ethereum address or ENS name.
 */
const fetchProfile = async (identifier: string) =>
  await db.query.profile.findFirst({
    where: or(eq(profile.address, identifier), eq(profile.ens, identifier)),
  })

/**
 * Updates or creates a profile for an Ethereum address.
 * Fetches ENS data if available and stores it in the database.
 */
const updateProfile = async (address: `0x${string}`, providedEns: string | null = null) => {
  // Use provided ENS name or look it up
  const ens = providedEns || (await client.getEnsName({ address })) || null

  // Initialize empty profile data structure
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

  // Only fetch ENS data if an ENS name exists
  if (ens) {
    const normalizedEns = normalize(ens)
    const [avatar, description, url, email, twitter, github] = await Promise.all([
      client.getEnsAvatar({ name: normalizedEns }),
      client.getEnsText({ name: normalizedEns, key: 'description' }),
      client.getEnsText({ name: normalizedEns, key: 'url' }),
      client.getEnsText({ name: normalizedEns, key: 'email' }),
      client.getEnsText({ name: normalizedEns, key: 'com.twitter' }),
      client.getEnsText({ name: normalizedEns, key: 'com.github' }),
    ])

    // Assign updated values
    if (avatar) data.avatar = avatar
    if (description) data.description = description
    if (url) data.links.url = url
    if (email) data.links.email = email
    if (twitter) data.links.twitter = twitter
    if (github) data.links.github = github
  }

  // Insert or update the profile in the database
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
