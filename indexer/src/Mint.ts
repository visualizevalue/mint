import { zeroAddress } from 'viem'
import { ponder } from 'ponder:registry'
import { artifact, collection, ownership, mint, transfer } from '../ponder.schema'
import onNewMint from '../handlers/mint/new-mint'
import { onTransferSingle, onTransferBatch } from '../handlers/mint/transfer'
import { parseJson } from '../utils/json'

ponder.on('Mint:NewMint', onNewMint)

ponder.on('Mint:TransferSingle', onTransferSingle)

ponder.on('Mint:TransferBatch', onTransferBatch)

