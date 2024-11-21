import { normalize } from 'viem/ens'
import { profile } from '../ponder.schema'
import { publicClient } from '../utils/client'

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
      last_updated: BigInt(Date.now()),
    }

    await db.insert(profile).values({ ens, ...data }).onConflictDoUpdate(data)
  } catch (e) {
    console.warn(`Error fetching profile:`, e)
  }
}

