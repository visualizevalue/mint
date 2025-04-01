import { publicClients } from 'ponder:api'
import { eq } from 'drizzle-orm'
import { normalize } from 'viem/ens'
import { type Context } from 'hono'
import { db } from '../offchain'
import { profile } from '../offchain/schema'

const client = publicClients[1]

const fetchProfile = async (address: `0x${string}`) =>
  await db.query.profile.findFirst({
    where: eq(profile.address, address),
  })

// TODO: Consider reverting if account has never interacted with mint
export const getProfile = async (c: Context) => {
  const address = c.req.param('address') as `0x${string}`

  // First check if we have a profile in the offchain database
  let cachedProfile = await fetchProfile(address)

  // Return cached profile data if it exists
  if (cachedProfile) return c.json(cachedProfile)

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

  return c.json(cachedProfile)
}
