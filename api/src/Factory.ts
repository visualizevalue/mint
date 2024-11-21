import { ponder } from '@/generated'
import { account, collection } from '../ponder.schema'
import { parseJson } from '../utils/json'
import { saveProfile } from '../utils/database'

ponder.on('Factory:Created', async ({ event, context }) => {
  const { client, db } = context
  const { Mint } = context.contracts
  const artist = event.args.ownerAddress
  const address = event.args.contractAddress

  const contractUri = await client.readContract({
    abi: Mint.abi,
    address,
    functionName: 'contractURI',
    args: [],
  })

  const json = Buffer.from(contractUri.substring(29), `base64`).toString()
  const metadata = parseJson(json)

  await db.insert(collection).values({
    address,
    name: metadata.name || '',
    symbol: metadata.symbol || '',
    description: metadata.description || '',
    image: metadata.image || '',
    artist,
    owner: artist,
    init_block: event.block.number,
    total_supply: 0n,
    latest_token_id: 0n,
  })

  // save artist account
  const ens = await client.getEnsName({ address: artist })
  await db.insert(account).values({ address: artist, ens }).onConflictDoUpdate({ ens })

  // attempt to save artist profile
  await saveProfile(ens, { db })
})

