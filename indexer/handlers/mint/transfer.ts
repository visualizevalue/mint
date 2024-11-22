import { getArtifact, getCollection, createArtifact, computeTransfer } from '../../utils/database'


export const onTransferSingle = async ({ event, context }) => {
  const collectionAddress = event.log.address
  const id = event.args.id

  // Ensure the collection exists
  await getCollection(collectionAddress, context)

  // Keep track of the artifact
  await getArtifact(collectionAddress, id, context)

  // Handle the actual transfer
  await computeTransfer({
    address: collectionAddress,
    id,
    hash: event.transaction.hash,
    block_number: event.block.number,
    log_index: event.log.logIndex,
    timestamp: event.block.timestamp,
    from: event.args.from,
    to: event.args.to,
    amount: event.args.value,
  }, context)
}

export const onTransferBatch = async ({ event, context }) => {
  const { client, db } = context
  const collectionAddress = event.log.address
  const ids = event.args.ids
  const values = event.args.values

  for (let idx = 0; idx < ids.length; idx++) {
    await computeTransfer({
      address: collectionAddress,
      id: ids[idx],
      hash: event.transaction.hash,
      block_number: event.block.number,
      log_index: event.log.logIndex,
      timestamp: event.block.timestamp,
      from: event.args.from,
      to: event.args.to,
      amount: values[idx],
    }, context)
  }
}

