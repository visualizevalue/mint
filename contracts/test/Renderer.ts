import hre from 'hardhat'
import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { itemMintedFixture } from './fixtures'
import { TOKEN_TIME } from './constants'

describe('Renderer', async () => {

  it('should expose the name and version', async () => {
    const { mint } = await loadFixture(itemMintedFixture)

    const rendererAddress = await mint.read.renderers([0n])
    const renderer = await hre.viem.getContractAt('Renderer', rendererAddress)

    expect(await renderer.read.name()).to.equal('Base Renderer')
    expect(await renderer.read.version()).to.equal(1)
  })

  it('should expose the token URI', async () => {
    const { mint } = await loadFixture(itemMintedFixture)

    const rendererAddress = await mint.read.renderers([0n])
    const renderer = await hre.viem.getContractAt('Renderer', rendererAddress)

    const tokenData = await mint.read.get([1n])
    const token = {
      name: tokenData[0],
      description: tokenData[1],
      artifact: tokenData[2],
      renderer: tokenData[3],
      mintedBlock: tokenData[4],
      closeAt: tokenData[5],
      data: tokenData[6],
    }

    const uri = await renderer.read.uri([1n, token])
    const json = Buffer.from(uri.substring(29), `base64`).toString()
    const data = JSON.parse(json)

    expect(data.name).to.equal(`VVM1`)
    expect(data.description).to.equal(`Lorem Ipsum dolor sit amet.`)
    expect(data.image).to.equal(TOKEN_TIME)
  })

  it('should expose the image URI', async () => {
    const { mint } = await loadFixture(itemMintedFixture)

    const rendererAddress = await mint.read.renderers([0n])
    const renderer = await hre.viem.getContractAt('Renderer', rendererAddress)

    const tokenData = await mint.read.get([1n])
    const token = {
      name: tokenData[0],
      description: tokenData[1],
      artifact: tokenData[2],
      renderer: tokenData[3],
      mintedBlock: tokenData[4],
      closeAt: tokenData[5],
      data: tokenData[6],
    }

    const uri = await renderer.read.imageURI([1n, token])
    expect(uri).to.equal(TOKEN_TIME)
  })

  it('should expose the animation URI', async () => {
    const { mint } = await loadFixture(itemMintedFixture)

    const rendererAddress = await mint.read.renderers([0n])
    const renderer = await hre.viem.getContractAt('Renderer', rendererAddress)

    const tokenData = await mint.read.get([1n])
    const token = {
      name: tokenData[0],
      description: tokenData[1],
      artifact: tokenData[2],
      renderer: tokenData[3],
      mintedBlock: tokenData[4],
      closeAt: tokenData[5],
      data: tokenData[6],
    }

    const uri = await renderer.read.animationURI([1n, token])
    expect(uri).to.equal('')
  })

})
