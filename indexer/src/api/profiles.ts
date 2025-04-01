import { db, publicClients } from 'ponder:api'
import schema from 'ponder:schema'
import { eq, replaceBigInts } from 'ponder'
import { normalize } from 'viem/ens'
import { type Context } from 'hono'

const client = publicClients[1]

export const getProfile = async (c: Context) => {
  const address = c.req.param('address') as `0x${string}`

  const account = await db.query.account.findFirst({
    where: eq(schema.account.address, address),
  })
  // TODO: Consider reverting if account has never interacted with mint

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
  }

  return c.json(replaceBigInts({ ...account, ...data }, String))
}
