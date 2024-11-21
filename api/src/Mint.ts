import { ponder } from '@/generated'
import { collection, ownership, mint, transfer } from '../ponder.schema'

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
      gas_used: event.transactionReceipt.cumulativeGasUsed,
      gas_fee: event.block.baseFeePerGas,
      unit_price: event.args.unitPrice,
      price: event.args.unitPrice * event.args.amount,
      amount: event.args.amount,
      account: event.args.minter,
    })
    .onConflictDoNothing()

  await db
    .insert(ownership)
    .values({
      account: event.args.minter,
      collection: event.log.address,
      artifact: event.args.tokenId,
      balance: event.args.amount,
    })
    .onConflictDoUpdate((row) => ({ balance: row.balance += event.args.amount }))
})

ponder.on('Mint:TransferSingle', async ({ event, context }) => {
  const { client, db } = context
  // console.log(
  //   `Handling Artifact TransferSingle @ ${event.log.address}`,
  //   event.args
  // )
})

ponder.on('Mint:TransferBatch', async ({ event, context }) => {
  // console.log(
  //   `Handling Artifact TransferBatch @ ${event.log.address}`,
  //   event.args
  // )
})

