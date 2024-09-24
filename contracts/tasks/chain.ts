import { mine } from '@nomicfoundation/hardhat-network-helpers'
import { takeRandom, delay } from '@visualizevalue/mint-utils'
import { task } from 'hardhat/config'
import { Client } from 'viem'

task('mine', 'Mine a given number of blocks')
  .addParam<string>('blocks', 'The number of blocks to mine', '300')
  .setAction(async ({ blocks }) => {
    await mine(BigInt(blocks))
  })

task('block', 'Ge the current block')
  .setAction(async (_, hre) => {
    const client = await hre.viem.getPublicClient()

    console.log(await client.getBlockNumber())
  })

task('purchase', 'Purchase a given token')
  .addParam<`0x${string}`>('collection', 'The collection to mint on')
  .addParam<number>('tokenId', 'The token ID to mint')
  .addParam<number>('count', 'The number of mint events to kick off')
  .setAction(async ({ collection, tokenId, count }, hre) => {
    const clients = await hre.viem.getWalletClients()
    const contract = await hre.viem.getContractAt('Mint', collection)
    const client = await hre.viem.getPublicClient()

    for (let i = 0; i < count; i++) {
      await delay(500)
      const user = takeRandom(clients) as Client
      const amount = BigInt(parseInt(( Math.random() * 10 + 1).toString()))
      await contract.write.mint([ tokenId, amount ], {
        value: await client.getGasPrice() * 60_000n * BigInt(amount),
        account: user.account
      })
    }
  })

