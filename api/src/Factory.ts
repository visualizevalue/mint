import { ponder } from '@/generated'
import { collections } from '../ponder.schema'
import { parseJson } from '../utils/json'

ponder.on('Factory:Created', async ({ event, context }) => {
  const { client } = context
  const { Mint } = context.contracts
  const address = event.args.contractAddress

  const contractUri = await client.readContract({
    abi: Mint.abi,
    address,
    functionName: 'contractURI',
    args: [],
  })

  const json = Buffer.from(contractUri.substring(29), `base64`).toString()
  const metadata = parseJson(json)

  await context.db.insert(collections).values({
    address,
    name: metadata.name,
    symbol: metadata.symbol,
    description: metadata.description,
    image: metadata.image,
    artist: event.args.ownerAddress,
    owner: event.args.ownerAddress,
    init_block: event.block.number,
    total_supply: 0n,
    latest_token_id: 0n,
  })
})

// ponder.on("Blitmap:Mint", async ({ event, context }) => {
//   const { client } = context;
//   //      ^? ReadonlyClient<"mainnet">
//   const { Blitmap } = context.contracts;
//   //      ^? {
//   //           abi: [...]
//   //           address: "0x8d04...D3Ff63",
//   //         }
//
//   // Fetch the URI for the newly minted token.
//   const tokenUri = await client.readContract({
//     abi: Blitmap.abi,
//     address: Blitmap.address,
//     functionName: "tokenURI",
//     args: [event.args.tokenId],
//   });
//
//   // Insert a Token record, including the URI.
//   await context.db.insert(tokens).values({
//     id: event.args.tokenId,
//     uri: tokenUri,
//   });
// });
