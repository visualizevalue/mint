import hre from 'hardhat'
import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { baseFixture } from './fixtures'

describe('Renderer', async () => {

  it('should expose the name an version', async () => {
    await loadFixture(baseFixture)

    const renderer = await hre.viem.deployContract('Renderer')

    expect(await renderer.read.name()).to.equal('Base Renderer')
    expect(await renderer.read.version()).to.equal(1)
  })

})
