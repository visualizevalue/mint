import { ponder } from '@/generated'
import { collections } from '../ponder.schema'

ponder.on('Mint:TransferSingle', async ({ event, context }) => {
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

