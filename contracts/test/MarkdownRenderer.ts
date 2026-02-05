import fs from 'fs'
import path from 'path'
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

const MARKDOWN_LONG = `# On-Chain Markdown

> To mint is a human right.

## Introduction

This document demonstrates how **markdown content** can be stored entirely on-chain as an NFT artifact. The renderer generates a preview SVG and serves the raw markdown via \`animation_url\`.

## How It Works

1. The artist writes markdown content
2. The content is stored on-chain via SSTORE2
3. The renderer generates an SVG preview image
4. The full markdown is served as a \`data:text/markdown\` URI

## Code Example

\`\`\`solidity
function mint(string memory content) external {
    // Store markdown on-chain
    create("My Post", "A description", toByteArray(content), rendererIndex, 0);
}
\`\`\`

## Features

- **On-chain storage** — content lives forever on Ethereum
- **SVG preview** — generated image for marketplace display
- **Raw access** — full markdown available via animation_url
- **Special chars** — handles <html>, "quotes", & ampersands safely

---

*Built with the Visualize Value Mint protocol.*`

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
    const markdown = Buffer.from(data.animation_url.substring(26), 'base64').toString()
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

    const markdown = Buffer.from(animationUri.substring(26), 'base64').toString()
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
    const markdown = Buffer.from(animationUri.substring(26), 'base64').toString()
    expect(markdown).to.equal(MARKDOWN_WITH_SPECIAL_CHARS)
  })

})

// Run with: RENDER_OUTPUT=true npx hardhat test test/MarkdownRenderer.ts --grep "render output"
const describeOutput = process.env.RENDER_OUTPUT ? describe : describe.skip
describeOutput('MarkdownRenderer render output', async () => {
  const OUTPUT_DIR = path.join(__dirname, '..', 'test-output', 'markdown-renderer')

  let artifactReader, mint, renderer

  before(async () => {
    const { artifactReader: ar, mint: m } = await loadFixture(itemMintedFixture)

    artifactReader = ar
    mint = m

    renderer = await hre.viem.deployContract('MarkdownRenderer', [], {
      libraries: {
        ArtifactReader: artifactReader.address,
      }
    })

    await mint.write.registerRenderer([renderer.address])
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  })

  // Token 1 is created by itemMintedFixture, so our tokens start at 2
  let nextTokenId = 2n

  const examples = [
    { name: 'short',   title: 'My Post',          description: 'A short post.',              markdown: MARKDOWN },
    { name: 'special', title: 'Special <Chars>',   description: 'Has special characters.',      markdown: MARKDOWN_WITH_SPECIAL_CHARS },
    { name: 'long',    title: 'On-Chain Markdown',  description: 'A longer document example.', markdown: MARKDOWN_LONG },
  ]

  for (const example of examples) {
    it(`render output: ${example.name}`, async () => {
      const tokenId = nextTokenId++

      await mint.write.create([
        example.title,
        example.description,
        toByteArray(example.markdown),
        1,
        0n,
      ])

      // Get full token URI via the Mint contract
      // @ts-ignore
      const tokenURI = await mint.read.uri([tokenId], { gas: 1_000_000_000 })

      // Decode JSON metadata
      const json = Buffer.from(tokenURI.substring(29), 'base64').toString()
      const metadata = JSON.parse(json)

      // Write token URI JSON
      fs.writeFileSync(
        path.join(OUTPUT_DIR, `${example.name}.json`),
        JSON.stringify(metadata, null, 2),
      )

      // Write SVG preview image
      const svg = Buffer.from(metadata.image.substring(26), 'base64').toString()
      fs.writeFileSync(
        path.join(OUTPUT_DIR, `${example.name}.svg`),
        svg,
      )

      // Write decoded markdown
      const md = Buffer.from(metadata.animation_url.substring(26), 'base64').toString()
      fs.writeFileSync(
        path.join(OUTPUT_DIR, `${example.name}.md`),
        md,
      )

      console.log(`      → ${OUTPUT_DIR}/${example.name}.{json,svg,md}`)
    })
  }
})
