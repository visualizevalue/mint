import { task } from 'hardhat/config'
import { decodeAbiParameters, encodeAbiParameters } from 'viem'
import { P5_HELLO_WORLD_IMG, P5_HELLO_WORLD_SCRIPT } from '../test/constants'

task('interact:mint:uri', 'Exports an abi in its human readable form')
  .addParam('address', 'The mint contract address')
  .addParam('tokenId', 'The token id to query')
  .setAction(async ({ address, tokenId }, hre) => {
    const mint = await hre.viem.getContractAt('Mint', address)

    // @ts-ignore
    const dataURI = await mint.read.uri([BigInt(tokenId)], { gas: 1_000_000_000 })

    console.log(dataURI)

    const json = Buffer.from(dataURI.substring(29), `base64`).toString()
    const data = JSON.parse(json)

    console.log(data)
  })

