import { db as ponderDb, publicClients } from 'ponder:api'
import schema from 'ponder:schema'
import { eq, replaceBigInts } from 'ponder'
import { normalize } from 'viem/ens'
import { type Context } from 'hono'
import { db as offchainDb, profile } from '../offchain'

const client = publicClients[1]

export const getProfile = async (c: Context) => {
  const address = c.req.param('address') as `0x${string}`

  // Get account data from ponder
  const account = await ponderDb.query.account.findFirst({
    where: eq(schema.account.address, address),
  })
  // TODO: Consider reverting if account has never interacted with mint

  // First check if we have a profile in the offchain database
  const offchainProfile = await offchainDb.query.profile.findFirst({
    where: eq(profile.address, address),
  })

  if (offchainProfile) {
    // Return cached profile data if it exists
    return c.json(replaceBigInts({ 
      ...account, 
      ens: offchainProfile.ens,
      ...(offchainProfile.data || {})
    }, String))
  }

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
    updated_at: BigInt(Date.now()),
  }

  const ens = (await client.getEnsName({ address })) || ''

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

    // Store the profile in the offchain database for future requests
    await offchainDb.insert(profile).values({
      address,
      ens,
      data,
    }).onConflictDoUpdate({
      target: profile.address,
      set: {
        ens,
        data,
      }
    })
  }

  return c.json(replaceBigInts({ ...account, ens, ...data }, String))
}
