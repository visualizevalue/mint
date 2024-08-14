import { getAddress, zeroAddress } from 'viem'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { expect } from 'chai'
import { ICON } from './constants'
import { collectionFixture, factoryFixture } from './fixtures'

describe('Factory', function () {
  it('creates a new Mint contract', async function () {
    const { factory, owner } = await loadFixture(factoryFixture)

    await expect(factory.write.create([
      'VV Mints',
      'VVM',
      'Lorem Ipsum dolor sit amet.',
      ICON,
    ])).to.emit(factory, 'Created')
       .withArgs(getAddress(owner.account.address), '0x5392A33F7F677f59e833FEBF4016cDDD88fF9E67')
  })

  it('clones a new Mint contract', async function () {
    const { factory } = await loadFixture(factoryFixture)

    await expect(factory.write.clone([
      'VV Mints',
      'VVM',
      'Lorem Ipsum dolor sit amet.',
      ICON,
    ])).to.be.fulfilled
  })

  it('prevents reinitialization', async function () {
    const { mint, owner } = await loadFixture(collectionFixture)

    await expect(mint.write.init([
      'Nope', 'NP', 'Bad intent', '', zeroAddress, owner.account.address
    ])).to.be.revertedWithCustomError(mint, 'Initialized')
  })

  it('sets the correct owner', async function () {
    const { mint, owner } = await loadFixture(collectionFixture)

    expect(await mint.read.owner()).to.equal(getAddress(owner.account.address))
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
})
