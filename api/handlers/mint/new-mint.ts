import { mint } from '../../ponder.schema'

const onNewMint = async ({ event, context }) => {
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

  // // maybe update collector account
  //
  // const ens = await client.getEnsName({ address: event.args.minter })
  // await db.insert(account).values({ address: artist, ens }).onConflictDoUpdate({ ens })
}

export default onNewMint

