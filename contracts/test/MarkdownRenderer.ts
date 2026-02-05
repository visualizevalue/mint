import hre from 'hardhat'
import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { toByteArray } from '@visualizevalue/mint-utils'
import { itemMintedFixture } from './fixtures'

const MARKDOWN = `# Hello World

This is a **markdown** document.

## Features

- Item one
- Item two
- Item three

Some \`inline code\` and more text.`

const MARKDOWN_WITH_SPECIAL_CHARS = `# Title <script>alert("xss")</script>

This has & ampersands and <angle brackets>.`

describe('MarkdownRenderer', async () => {
  let artifactReader, mint, renderer

  beforeEach(async () => {
    const { artifactReader: ar, mint: m } = await loadFixture(itemMintedFixture)

    artifactReader = ar
    mint = m

    renderer = await hre.viem.deployContract('MarkdownRenderer', [], {
      libraries: {
        ArtifactReader: artifactReader.address,
      }
    })

    await mint.write.registerRenderer([renderer.address])
  })

  it('should expose the name and version', async () => {
    expect(await renderer.read.name()).to.equal('Markdown Renderer')
    expect(await renderer.read.version()).to.equal(1)
  })

  it('allows minting and reading markdown artifacts', async () => {
    await expect(mint.write.create([
      'My Post',
      'A markdown post.',
      toByteArray(MARKDOWN),
      1,
      0n,
    ])).to.be.fulfilled

    // @ts-ignore
    const dataURI = await mint.read.uri([2n], { gas: 1_000_000_000 })

    const json = Buffer.from(dataURI.substring(29), `base64`).toString()
    const data = JSON.parse(json)

    expect(data.id).to.equal('2')
    expect(data.name).to.equal('My Post')
    expect(data.description).to.equal('A markdown post.')
    expect(data.type).to.equal('markdown')
    expect(data.image).to.contain('data:image/svg+xml;base64,')
    expect(data.animation_url).to.contain('data:text/markdown;base64,')

    // Decode animation_url to verify original markdown
    const markdown = Buffer.from(data.animation_url.substring(27), 'base64').toString()
    expect(markdown).to.equal(MARKDOWN)
  })

  it('should expose the image and animation URIs individually', async () => {
    await expect(mint.write.create([
      'Post',
      '',
      toByteArray(MARKDOWN),
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
    expect(imageUri).to.contain('data:image/svg+xml;base64,')

    // Decode SVG and verify it contains the token name
    const svg = Buffer.from(imageUri.substring(26), 'base64').toString()
    expect(svg).to.contain('Post')

    const animationUri = await renderer.read.animationURI([2n, token])
    expect(animationUri).to.contain('data:text/markdown;base64,')

    const markdown = Buffer.from(animationUri.substring(27), 'base64').toString()
    expect(markdown).to.equal(MARKDOWN)
  })

  it('should escape special characters in SVG preview', async () => {
    await expect(mint.write.create([
      'Special <Chars>',
      '',
      toByteArray(MARKDOWN_WITH_SPECIAL_CHARS),
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
    const svg = Buffer.from(imageUri.substring(26), 'base64').toString()

    // Title should have escaped angle brackets
    expect(svg).to.contain('Special &lt;Chars&gt;')
    // Content should have escaped characters
    expect(svg).to.contain('&amp;')
    expect(svg).to.contain('&lt;')

    // Raw markdown in animation_url should be unescaped
    const animationUri = await renderer.read.animationURI([2n, token])
    const markdown = Buffer.from(animationUri.substring(27), 'base64').toString()
    expect(markdown).to.equal(MARKDOWN_WITH_SPECIAL_CHARS)
  })

})
