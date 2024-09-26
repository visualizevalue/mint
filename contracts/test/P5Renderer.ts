import { getAddress, encodeAbiParameters } from 'viem'
import hre from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { toByteArray } from '@visualizevalue/mint-utils'
import { expect } from 'chai'
import { ICON } from './constants'
import { itemMintedFixture } from './fixtures'

describe('P5Renderer', () => {

  it('allows minting (and reading) artifacts', async () => {
    const { mint } = await loadFixture(itemMintedFixture)

    const p5Renderer = await hre.viem.deployContract('P5Renderer', [])

    await expect(mint.write.registerRenderer([p5Renderer.address]))
      .to.emit(mint, 'NewRenderer')
      .withArgs(getAddress(p5Renderer.address), 1n)

    const encodedArtifact = encodeAbiParameters(
      [ { type: 'string', name: 'image' }, { type: 'string', name: 'script' } ],
      [ ICON, `alert('hello world')` ],
    )

    await expect(mint.write.create([
      'Hello World',
      '',
      toByteArray(encodedArtifact),
      1,
      19n,
    ])).to.be.fulfilled

    const dataURI = await mint.read.uri([2n])
    const json = Buffer.from(dataURI.substring(29), `base64`).toString()
    const data = JSON.parse(json)

    expect(data.image).to.equal(ICON)
    expect(data.animation_url).to.equal('data:text/html;base64,PCFET0NUWVBFIGh0bWw+PGh0bWwgbGFuZz0iZW4iPjxoZWFkPjxtZXRhIGNoYXJzZXQ9IlVURi04Ij48bWV0YSBuYW1lPSJ2aWV3cG9ydCIgY29udGVudD0id2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTEuMCI+PHRpdGxlPkhlbGxvIFdvcmxkPC90aXRsZT48c2NyaXB0IHNyYz0iaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvcDUuanMvMS40LjAvcDUuanMiPjwvc2NyaXB0PjxzdHlsZT4gYm9keSB7IG1hcmdpbjogMDsgcGFkZGluZzogMDsgfSA8L3N0eWxlPjwvaGVhZD48Ym9keT48c2NyaXB0PmFsZXJ0KCdoZWxsbyB3b3JsZCcpPC9zY3JpcHQ+PC9ib2R5PjwvaHRtbD4=')
  })

})
