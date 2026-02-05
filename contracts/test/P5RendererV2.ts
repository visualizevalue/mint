import { getAddress, encodeAbiParameters, zeroAddress } from 'viem'
import hre from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { toByteArray } from '@visualizevalue/mint-utils'
import { expect } from 'chai'
import { P5_HELLO_WORLD_HTML_URL, P5_HELLO_WORLD_IMG, P5_HELLO_WORLD_SCRIPT, P5_HELLO_WORLD_SCRIPT_URL } from './constants'
import { baseFixture, itemMintedFixture } from './fixtures'

// Need to test on mainnet fork for this to work...
// `FORK_MAINNET=true hh test test/P5RendererV2.ts`
describe.skip('P5RendererV2', () => {
  it('should expose the name of a version', async () => {
    await loadFixture(baseFixture)

    const artifactReader = await hre.viem.deployContract('ArtifactReader', [])
    const renderer = await hre.viem.deployContract('P5RendererV2', [], {
      libraries: {
        ArtifactReader: artifactReader.address,
      }
    })

    expect(await renderer.read.name()).to.equal('P5 Renderer')
    expect(await renderer.read.version()).to.equal(2)
  })

  it('allows minting (and reading) artifacts', async () => {
    const { artifactReader, mint } = await loadFixture(itemMintedFixture)

    const p5Renderer = await hre.viem.deployContract('P5RendererV2', [], {
      libraries: {
        ArtifactReader: artifactReader.address,
      }
    })

    await expect(mint.write.registerRenderer([p5Renderer.address]))
      .to.emit(mint, 'NewRenderer')
      .withArgs(getAddress(p5Renderer.address), 1n)

    const encodedArtifact = encodeAbiParameters(
      [ { type: 'string', name: 'image' }, { type: 'string', name: 'script' } ],
      [ P5_HELLO_WORLD_IMG, P5_HELLO_WORLD_SCRIPT ],
    )

    await expect(mint.write.create([
      'Hello World',
      '',
      toByteArray(encodedArtifact),
      1,
      0n,
    ])).to.be.fulfilled

    // @ts-ignore
    const dataURI = await mint.read.uri([2n], { gas: 1_000_000_000 })

    const json = Buffer.from(dataURI.substring(29), `base64`).toString()
    const data = JSON.parse(json)

    expect(data.image).to.equal(P5_HELLO_WORLD_IMG)
    expect(data.script_url).to.equal(undefined)
    expect(data.animation_url).to.equal(P5_HELLO_WORLD_HTML_URL)
  })

  it('should expose the individual data URIs', async () => {
    const { artifactReader, mint } = await loadFixture(itemMintedFixture)

    const p5Renderer = await hre.viem.deployContract('P5RendererV2', [], {
      libraries: {
        ArtifactReader: artifactReader.address,
      }
    })
    await mint.write.registerRenderer([p5Renderer.address])

    const encodedArtifact = encodeAbiParameters(
      [ { type: 'string', name: 'image' }, { type: 'string', name: 'script' } ],
      [ P5_HELLO_WORLD_IMG, P5_HELLO_WORLD_SCRIPT ],
    )

    await mint.write.create([
      'Hello World',
      '',
      toByteArray(encodedArtifact),
      1,
      0n,
    ])

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

    const imageUri = await p5Renderer.read.imageURI([2n, token])
    expect(imageUri).to.equal(P5_HELLO_WORLD_IMG)

    const animationUri = await p5Renderer.read.animationURI([2n, token])
    expect(animationUri).to.equal(P5_HELLO_WORLD_HTML_URL)

    const scriptUri = await p5Renderer.read.scriptURI([2n, token])
    expect(scriptUri).to.equal(P5_HELLO_WORLD_SCRIPT_URL)
  })

})
