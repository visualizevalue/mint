import { ponder } from 'ponder:registry'
import onNewMint from '../handlers/mint/new-mint'
import { onTransferSingle, onTransferBatch } from '../handlers/mint/transfer'

ponder.on('Mint:NewMint', onNewMint)

ponder.on('Mint:TransferSingle', onTransferSingle)

ponder.on('Mint:TransferBatch', onTransferBatch)

