import hre from 'hardhat'
import { expect } from 'chai'
import { encodeAbiParameters } from 'viem'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { toByteArray } from '@visualizevalue/mint-utils'
import { baseFixture, itemMintedFixture } from './fixtures'
import { TOKEN_TIME } from './constants'

describe('AnimationRenderer', async () => {
  let artifactReader, mint, renderer

  beforeEach(async () => {
    const { artifactReader: ar, mint: m } = await loadFixture(itemMintedFixture)

    artifactReader = ar
    mint = m

    renderer = await hre.viem.deployContract('AnimationRenderer', [], {
      libraries: {
        ArtifactReader: artifactReader.address,
      }
    })

    await mint.write.registerRenderer([renderer.address])
  })

  it('should expose the name of a version', async () => {
    expect(await renderer.read.name()).to.equal('Animation Renderer')
    expect(await renderer.read.version()).to.equal(1)
  })

  it('allows minting (and reading) artifacts', async () => {
    const encodedArtifact = encodeAbiParameters(
      [ { type: 'string', name: 'image' }, { type: 'string', name: 'animation' } ],
      [ 'ipfs://image', 'ipfs://video' ],
    )

    await expect(mint.write.create([
      'Time',
      '',
      toByteArray(encodedArtifact),
      1,
      0n,
    ])).to.be.fulfilled

    // @ts-ignore
    const dataURI = await mint.read.uri([2n], { gas: 1_000_000_000 })

    const json = Buffer.from(dataURI.substring(29), `base64`).toString()
    const data = JSON.parse(json)

    expect(data.image).to.equal('ipfs://image')
    expect(data.animation_url).to.equal('ipfs://video')
  })

  it('should expose the image and animation URIs individually', async () => {
    const encodedArtifact = encodeAbiParameters(
      [ { type: 'string', name: 'image' }, { type: 'string', name: 'animation' } ],
      [ 'ipfs://image', 'ipfs://video' ],
    )

    await expect(mint.write.create([
      'Token',
      '',
      toByteArray(encodedArtifact),
      1,
      0n,
    ])).to.be.fulfilled

    const tokenData = await mint.read.get([2n])
    const token = {
      name: tokenData[0],
      description: tokenData[1],
      artifact: tokenData[2],
      renderer: tokenData[3],
      mintedBlock: tokenData[4],
      closeAt: tokenData[5],
      data: tokenData[6],
    }

    const imageUri = await renderer.read.imageURI([2n, token])
    expect(imageUri).to.equal('ipfs://image')

    const animationUri = await renderer.read.animationURI([2n, token])
    expect(animationUri).to.equal('ipfs://video')
  })

})
