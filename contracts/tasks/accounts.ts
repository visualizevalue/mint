import { getAddress, parseEther } from 'viem'
import { task } from 'hardhat/config'

const JALIL = getAddress(`0xe11Da9560b51f8918295edC5ab9c0a90E9ADa20B`)
const VV = getAddress(`0xc8f8e2F59Dd95fF67c3d39109ecA2e2A017D4c8a`)

task('accounts', 'Prints the list of accounts', async (_, hre) => {
  const clients = await hre.viem.getWalletClients()

  for (const client of clients) {
    console.log(client.account.address)
  }
})

task('fund-account', 'Funds an account for testing')
  .addParam('address', 'The wallet address to fund', JALIL)
  .setAction(async ({ address }, hre) => {
    const [account] = await hre.viem.getWalletClients()

    await account.sendTransaction({ to: address, value: parseEther('1') })
  })
