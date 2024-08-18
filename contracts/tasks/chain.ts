import { mine } from '@nomicfoundation/hardhat-network-helpers'
import { task } from 'hardhat/config'

task('mine', 'Mine a given number of blocks')
  .addParam<string>('blocks', 'The number of blocks to mine', '300')
  .setAction(async ({ blocks }) => {
    await mine(BigInt(blocks))
  })
