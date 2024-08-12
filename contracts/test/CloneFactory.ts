import { getAddress } from 'viem'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { expect } from 'chai'
import { ICON } from './constants'
import { cloneCollectionFixture, cloneFactoryFixture } from './fixtures'

describe('CloneFactory', function () {
  it('creates a new collection', async function () {
    const { factory } = await loadFixture(cloneFactoryFixture)

    await expect(factory.write.create([
      'VV Mints',
      'VVM',
      'Lorem Ipsum dolor sit amet.',
      ICON,
    ])).to.be.fulfilled
  })

  it('sets the correct owner', async function () {
    const { mint, owner } = await loadFixture(cloneCollectionFixture)

    expect(await mint.read.owner()).to.equal(getAddress(owner.account.address))
  })

  it('sets the correct contract data', async function () {
    const { mint } = await loadFixture(cloneCollectionFixture)

    expect(await mint.read.name()).to.equal('VV Mints')
    expect(await mint.read.symbol()).to.equal('VVM')
    expect(await mint.read.description()).to.equal('Lorem Ipsum dolor sit amet.')
    expect(await mint.read.image()).to.equal(ICON)

    const dataURI = await mint.read.contractURI()
    const json = Buffer.from(dataURI.substring(29), `base64`).toString()
    const data = JSON.parse(json)

    expect(data.name).to.equal(`VV Mints`)
    expect(data.symbol).to.equal(`VVM`)
    expect(data.description).to.equal(`Lorem Ipsum dolor sit amet.`)
    expect(data.image).to.equal(ICON)
  })
})
