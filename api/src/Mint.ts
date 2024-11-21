import { zeroAddress } from 'viem'
import { ponder } from '@/generated'
import { artifact, collection, ownership, mint, transfer } from '../ponder.schema'
import { parseJson } from '../utils/json'

ponder.on('Mint:NewMint', async ({ event, context }) => {
  const { client, db } = context

  await db
    .insert(mint)
    .values({
      collection: event.log.address,
      artifact: event.args.tokenId,
      hash: event.transaction.hash,
      block_number: event.block.number,
      log_index: event.log.logIndex,
      timestamp: event.block.timestamp,
      gas_used: event.transactionReceipt.gasUsed,
      gas_price: event.transactionReceipt.effectiveGasPrice,
      gas_fee: event.transactionReceipt.gasUsed * event.transactionReceipt.effectiveGasPrice,
      unit_price: event.args.unitPrice,
      price: event.args.unitPrice * event.args.amount,
      amount: event.args.amount,
      account: event.args.minter,
    })
    .onConflictDoNothing()
})

ponder.on('Mint:TransferSingle', async ({ event, context }) => {
  const { client, db } = context
  const { Mint } = context.contracts
  const collectionAddress = event.log.address

  // Keep track of the artifact
  let storedArtifact = await db.find(artifact, {
    collection: collectionAddress,
    id: event.args.id,
  })

  if (! storedArtifact) {
    // Fetch artifact data
    let metadata = {
      name: '',
      description: '',
      image: '',
      animation_url: '',
    }
    try {
      const uri = await client.readContract({
        abi: Mint.abi,
        address: collectionAddress,
        functionName: 'uri',
        args: [event.args.id],
      })

      const json = Buffer.from(uri.substring(29), `base64`).toString()
      const data = parseJson(json)
      Object.keys(data).forEach(key => {
        metadata[key] = data[key]
      })
    } catch (e) {
      console.warn(`Fetching metadata for ${collectionAddress}:${event.args.id} failed.`, e)
    }

    // Store artifact
    storedArtifact = await db
      .insert(artifact)
      .values({
        collection: collectionAddress,
        id: event.args.id,
        ...metadata,
        supply: 0n,
      })
      .onConflictDoNothing()
  }

  // Store Transfer
  try {
    await db
      .insert(transfer)
      .values({
        collection: collectionAddress,
        artifact: event.args.id,
        hash: event.transaction.hash,
        block_number: event.block.number,
        log_index: event.log.logIndex,
        timestamp: event.block.timestamp,
        amount: event.args.value,
        from: event.args.from,
        to: event.args.to,
      })
      .onConflictDoNothing()
  } catch (e) {
    console.warn('sth went wrong', e)
  }

  // New Transfer; Increase supply
  if (event.args.from === zeroAddress) {
    await db
      .update(artifact, { collection: collectionAddress, id: event.args.id })
      .set((row) => ({ supply: row.supply + event.args.value }))
  }
  // Subtract the balance from the sender
  else {
    await db
      .insert(ownership)
      .values({
        account: event.args.from,
        collection: collectionAddress,
        artifact: event.args.id,
        balance: 0n,
      })
      .onConflictDoUpdate((row) => ({ balance: row.balance -= event.args.value }))
  }

  // Add the balance to the recipient
  if (event.args.to !== zeroAddress) {
    await db
      .insert(ownership)
      .values({
        collection: collectionAddress,
        account: event.args.to,
        artifact: event.args.id,
        balance: event.args.value,
      })
      .onConflictDoUpdate((row) => ({ balance: row.balance += event.args.value }))
  }
})

ponder.on('Mint:TransferBatch', async ({ event, context }) => {
  // console.log(
  //   `Handling Artifact TransferBatch @ ${event.log.address}`,
  //   event.args
  // )
})

