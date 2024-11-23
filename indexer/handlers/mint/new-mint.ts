import { mint } from '../../ponder.schema'
import { getAccount } from '../../utils/database'

const onNewMint = async ({ event, context }) => {
  await getAccount(event.args.minter, context, { fetch_ens: process.env.FETCH_COLLECTOR_ENS === 'true' })

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
}

export default onNewMint

