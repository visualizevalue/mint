import { eq, or } from 'drizzle-orm'
import { type Context } from 'hono'
import { isAddress } from 'viem'
import { normalize } from 'viem/ens'
import { publicClients } from 'ponder:api'
import { db } from '../offchain'
import { profile } from '../offchain/schema'
import { ONE_MONTH } from '../../utils/time'

const client = publicClients.mainnet

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
  // Get ID parameter and normalize if needed
  const identifier = c.req.param('id')
  const result = await resolveProfile(identifier)

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
  // Get ID parameter and normalize if needed
  const identifier = c.req.param('id')
  const result = await resolveProfile(identifier)

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
    const address = identifier.toLowerCase() as `0x${string}`
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
    // Normalize ENS name to lowercase
    const normalizedEns = identifier.toLowerCase()
    // First check if we have this ENS name in the database
    const cachedProfile = await fetchProfile(normalizedEns)

    if (cachedProfile) {
      return {
        address: cachedProfile.address as `0x${string}`,
        ensName: normalizedEns,
        cachedProfile,
        isFresh: isFresh(cachedProfile.updated_at),
      }
    }

    // If no profile in database, resolve the ENS name on-chain
    const address = await client.getEnsAddress({
      name: normalize(normalizedEns),
    })

    // If address is null, throw an error to get into the catch block
    if (!address) {
      throw new Error(`No address found for ENS name ${normalizedEns}`)
    }

    // Ensure address is lowercase
    const normalizedAddress = address.toLowerCase() as `0x${string}`
    return {
      address: normalizedAddress,
      ensName: normalizedEns,
      cachedProfile: null,
      isFresh: false,
    }
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
const fetchProfile = async (identifier: string) => {
  // If identifier looks like an address, ensure it's lowercase
  const normalizedIdentifier = isAddress(identifier) ? identifier.toLowerCase() : identifier

  return await db.query.profile.findFirst({
    where: or(
      eq(profile.address, normalizedIdentifier),
      eq(profile.ens, normalizedIdentifier),
    ),
  })
}

/**
 * Updates or creates a profile for an Ethereum address.
 * Fetches ENS data if available and stores it in the database.
 */
const updateProfile = async (address: `0x${string}`, providedEns: string | null = null) => {
  // Ensure address is lowercase
  const normalizedAddress = address.toLowerCase() as `0x${string}`

  // Use provided ENS name or look it up, ensuring it's lowercase
  let ens = providedEns || (await client.getEnsName({ address: normalizedAddress })) || null
  if (ens) {
    ens = ens.toLowerCase()
  }

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
      address: normalizedAddress,
      ...insertData,
    })
    .onConflictDoUpdate({
      target: profile.address,
      set: insertData,
    })
}
