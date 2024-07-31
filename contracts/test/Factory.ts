import {
  loadFixture,
} from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'

const ICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='black'/%3E%3Ccircle cx='32' cy='32' r='12' fill='white'/%3E%3C/svg%3E`
const TOKEN_TIME = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' fill='none' style='background: black;'%3E%3Cdefs%3E%3Ccircle id='circle' cx='500' cy='500' r='45' stroke-width='5' /%3E%3C/defs%3E%3Crect width='1000' height='1000' fill='black'/%3E%3Cuse href='%23circle' transform='translate(-180)' stroke='hsl(0, 0%25, 20%25)' /%3E%3Cuse href='%23circle' stroke='hsl(0, 0%25, 100%25)' stroke-dasharray='283' stroke-dashoffset='0' transform='translate(-180) rotate(-90 500 500)' %3E%3Canimate id='third_0' begin='third_2.end' attributeName='stroke-dashoffset' from='283' to='566' dur='0.1s' fill='freeze' /%3E%3Canimate id='third_1' begin='third_0.end' attributeName='opacity' from='0' to='1' dur='5s' fill='freeze' /%3E%3Canimate id='third_2' begin='second_2.end' attributeName='stroke-dashoffset' from='566' to='283' dur='10s' fill='freeze' /%3E%3Canimate begin='second_2.end+5s' attributeName='opacity' from='1' to='0' dur='5s' fill='freeze' /%3E%3C/use%3E%3Cuse href='%23circle' stroke='hsl(0, 0%25, 20%25)' /%3E%3Cuse href='%23circle' stroke='hsl(0, 0%25, 100%25)' stroke-dasharray='283' stroke-dashoffset='0' transform='rotate(-90 500 500)' %3E%3Canimate id='second_0' begin='third_2.end' attributeName='stroke-dashoffset' from='283' to='566' dur='0.1s' fill='freeze' /%3E%3Canimate id='second_1' begin='second_0.end' attributeName='opacity' from='0' to='1' dur='5s' fill='freeze' /%3E%3Canimate id='second_2' begin='first_2.end' attributeName='stroke-dashoffset' from='566' to='283' dur='10s' fill='freeze' /%3E%3Canimate begin='first_2.end+5s' attributeName='opacity' from='1' to='0' dur='5s' fill='freeze' /%3E%3C/use%3E%3Cuse href='%23circle' transform='translate(180)' stroke='hsl(0, 0%25, 20%25)' /%3E%3Cuse href='%23circle' stroke='hsl(0, 0%25, 100%25)' stroke-dasharray='283' stroke-dashoffset='0' transform='translate(180) rotate(-90 500 500)' %3E%3Canimate id='first_0' begin='third_2.end' attributeName='stroke-dashoffset' from='283' to='566' dur='0.1s' fill='freeze' /%3E%3Canimate id='first_1' begin='first_0.end' attributeName='opacity' from='0' to='1' dur='5s' fill='freeze' /%3E%3Canimate id='first_2' begin='0s;first_1.end' attributeName='stroke-dashoffset' from='566' to='283' dur='10s' fill='freeze' /%3E%3Canimate begin='5s;first_1.end+5s' attributeName='opacity' from='1' to='0' dur='5s' fill='freeze' /%3E%3C/use%3E%3C/svg%3E%0A`

describe('Factory', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function factoryFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner] = await hre.viem.getWalletClients()

    const factory = await hre.viem.deployContract('Factory', [])

    const publicClient = await hre.viem.getPublicClient()

    return {
      factory,
      owner,
      publicClient,
    }
  }

  async function collectionFixture() {
    const { factory, owner, publicClient } = await loadFixture(factoryFixture)

    const hash = await factory.write.create(['VV Mints', 'Lorem Ipsum dolor sit amet.', ICON])
    await publicClient.waitForTransactionReceipt({ hash })

    const createdEvents = await factory.getEvents.Created()

    const mint = await hre.viem.getContractAt('Mint', createdEvents[0].args.contractAddress)

    return {
      mint,
      factory,
      owner,
      publicClient,
    }
  }

  it('mint a collection', async function () {
    const { factory, owner, publicClient } = await loadFixture(factoryFixture)

    const hash = await factory.write.create(['My Feed', 'Lorem Ipsum dolor sit amet', ICON])
    await publicClient.waitForTransactionReceipt({ hash })

    const createdEvents = await factory.getEvents.Created()
    expect(createdEvents).to.have.lengthOf(1)
    expect(createdEvents[0].args.ownerAddress?.toLowerCase()).to.equal(owner.account.address)
  })

  it('mint an artifact', async function () {
    const { mint, factory, owner, publicClient } = await loadFixture(collectionFixture)

    await expect(mint.write.create()).to.be.fulfilled
  })
})
