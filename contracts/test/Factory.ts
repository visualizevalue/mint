import { getAddress, zeroAddress } from 'viem'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'
import { toByteArray } from '@visualizevalue/mint-utils'
import { ICON, TOKEN_TIME } from './constants'
import { collectionFixture, factoryFixture } from './fixtures'

describe('Factory', function () {
  it('sets ownership on the factory', async function () {
    const { factory, owner } = await loadFixture(factoryFixture)

    expect(await factory.read.owner()).to.equal(getAddress(owner.account.address))
  })

  it('exposes the factory version', async function () {
    const { factory } = await loadFixture(factoryFixture)

    expect(await factory.read.version()).to.equal(1n)
  })

  it('ensures only an owner can upgrade the factory', async function () {
    const { factory, owner } = await loadFixture(factoryFixture)

    // Deploy our new implementation
    const mockV2Factory = await hre.viem.deployContract('MockV2Factory')

    // Deploy our new implementation
    await factory.write.upgradeToAndCall([mockV2Factory.address, '0x'])

    // Check the new version
    expect(await factory.read.version()).to.equal(999n)

    // Make sure we maintain ownership as expected
    expect(await factory.read.owner()).to.equal(getAddress(owner.account.address))
  })

  it('creates a new Mint contract', async function () {
    const { factory } = await loadFixture(factoryFixture)

    await expect(factory.write.create([
      'VV Mints',
      'VVM',
      'Lorem Ipsum dolor sit amet.',
      toByteArray(TOKEN_TIME),
    ])).to.emit(factory, 'Created')
  })

  it('clones a new Mint contract', async function () {
    const { factory } = await loadFixture(factoryFixture)

    await expect(factory.write.clone([
      'VV Mints',
      'VVM',
      'Lorem Ipsum dolor sit amet.',
      toByteArray(TOKEN_TIME),
    ])).to.be.fulfilled
  })

  it('prevents reinitialization', async function () {
    const { mint, owner } = await loadFixture(collectionFixture)

    await expect(mint.write.init([
      'Nope', 'NP', 'Bad intent', toByteArray(''), zeroAddress, owner.account.address
    ])).to.be.revertedWithCustomError(mint, 'Initialized')
  })

  it('sets the correct owner', async function () {
    const { mint, owner } = await loadFixture(collectionFixture)

    expect(await mint.read.owner()).to.equal(getAddress(owner.account.address))
  })

  it('exposes the mint contracts version', async function () {
    const { mint } = await loadFixture(collectionFixture)

    expect(await mint.read.version()).to.equal(1)
  })

  it('sets the correct contract data', async function () {
    const { mint } = await loadFixture(collectionFixture)

    const dataURI = await mint.read.contractURI()
    const json = Buffer.from(dataURI.substring(29), `base64`).toString()
    const data = JSON.parse(json)

    expect(data.name).to.equal(`VV Mints`)
    expect(data.symbol).to.equal(`VVM`)
    expect(data.description).to.equal(`Lorem Ipsum dolor sit amet.`)
    expect(data.image).to.equal(ICON)
  })

  it('allows querying the created collections', async function () {
    const { mint, factory, publicClient, owner } = await loadFixture(collectionFixture)

    const hash = await factory.write.create([
      'VV Mints 2',
      'VVM',
      'Lorem Ipsum dolor sit amet.',
      toByteArray(TOKEN_TIME),
    ])
    await publicClient.waitForTransactionReceipt({ hash })
    const createdEvents = await factory.getEvents.Created()
    const mint2 = await hre.viem.getContractAt('Mint', createdEvents[0].args.contractAddress)

    expect(JSON.stringify(await factory.read.getCreatorCollections([owner.account.address])))
      .to.equal(JSON.stringify([mint.address, mint2.address]))
  })
})
