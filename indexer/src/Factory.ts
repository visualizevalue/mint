import { ponder } from 'ponder:registry'
import { account, collection } from '../ponder.schema'
import { parseJson } from '../utils/json'
import { getAccount, saveProfile } from '../utils/database'

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

  const data = {
    name: metadata.name || '',
    symbol: metadata.symbol || '',
    description: metadata.description || '',
    image: metadata.image || '',
    artist,
    owner: artist,
    init_block: event.block.number,
    total_supply: 0n,
    latest_token_id: 0n,
  }

  await db.insert(collection).values({ address, ...data }).onConflictDoUpdate(data)

  // Save / update artist profile
  const accountData = await getAccount(artist, context, { fetch_ens: true })
  if (accountData.ens) await saveProfile(accountData.ens, context)
})

