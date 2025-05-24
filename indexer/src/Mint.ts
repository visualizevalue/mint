import { ponder } from 'ponder:registry'
import { mint } from 'ponder:schema'
import { computeTransfer, getAccount, getArtifact, getCollection } from '../utils/database'

ponder.on('Mint:NewMint', async ({ event, context }) => {
  await getAccount(event.args.minter, context)

  await context.db
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
  const collection = event.log.address
  const id = event.args.id

  // Ensure the collection exists
  await getCollection(collection, context)

  // Keep track of the artifact
  await getArtifact(collection, id, event.block.timestamp, event.block_number, context)

  // Handle the actual transfer
  await computeTransfer(
    {
      address: collection,
      id,
      hash: event.transaction.hash,
      block_number: event.block.number,
      log_index: event.log.logIndex,
      timestamp: event.block.timestamp,
      from: event.args.from,
      to: event.args.to,
      amount: event.args.value,
    },
    context,
  )
})

ponder.on('Mint:TransferBatch', async ({ event, context }) => {
  const collection = event.log.address
  const ids = event.args.ids
  const values = event.args.values

  for (let idx = 0; idx < ids.length; idx++) {
    await computeTransfer(
      {
        address: collection,
        id: ids[idx] as bigint,
        hash: event.transaction.hash,
        block_number: event.block.number,
        log_index: event.log.logIndex,
        timestamp: event.block.timestamp,
        from: event.args.from,
        to: event.args.to,
        amount: values[idx] || 0n,
      },
      context,
    )
  }
})
