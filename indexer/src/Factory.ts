import { ponder } from 'ponder:registry'
import { collection } from 'ponder:schema'
import { parseJson } from '../utils/json'
import { getAccount } from '../utils/database'
import { ContractMetadata } from '../utils/types'

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
  const metadata = parseJson<ContractMetadata>(json) || {
    name: '',
    symbol: '',
    description: '',
    image: '',
  }

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

  await db
    .insert(collection)
    .values({ address, ...data })
    .onConflictDoUpdate(data)

  // Ensure artist is stored
  await getAccount(artist, context)
})
