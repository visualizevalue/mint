import { parseGwei } from 'viem'
import hre from 'hardhat'
import {
  loadFixture, mine
} from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { expect } from 'chai'
import { JALIL, TOKEN_TIME } from './constants'
import { collectionFixture, itemMintedFixture } from './fixtures'

describe('Mint', () => {

  describe('Creating', async () => {

    it('create an onchain artifact', async () => {
      const { mint } = await loadFixture(collectionFixture)

      await expect(mint.write.create([
        'VVM1',
        'Lorem Ipsum dolor sit amet.',
        TOKEN_TIME,
        0n,
        0n,
      ])).to.emit(mint, 'NewMint').withArgs(1n)
    })

    it('create an offchain artifact', async () => {
      const { mint } = await loadFixture(collectionFixture)

      await expect(mint.write.create([
        'VVM1',
        'Lorem Ipsum dolor sit amet.',
        'ipfs://qmy3zdkwrqnwqenczocdrr3xgqfxjxmgefup4htqenbvwo',
        0n,
        0n,
      ])).to.emit(mint, 'NewMint').withArgs(1n)
    })

    it('mints tokens with incremental token IDs', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await expect(mint.write.create([
        'VVM2',
        'Lorem Ipsum dolor sit amet.',
        'ipfs://qmy3zdkwrqnwqenczocdrr3xgqfxjxmgefup4htqenbvwo',
        0n,
        0n,
      ])).to.emit(mint, 'NewMint').withArgs(2n)
    })

    it('mints the first token to the artist', async () => {
      const { mint, owner } = await loadFixture(itemMintedFixture)

      expect(await mint.read.balanceOf([owner.account.address, 1n])).to.equal(1n)
    })

    it('prevents anyone but the contract owner to create an artifact', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await expect(mint.write.create(
        [
          'VVM2',
          'Lorem Ipsum dolor sit amet.',
          'ipfs://qmy3zdkwrqnwqenczocdrr3xgqfxjxmgefup4htqenbvwo',
          0n,
          0n,
        ],
        { account: JALIL }
      )).to.be.revertedWithCustomError(mint, 'OwnableUnauthorizedAccount')
    })

  })

  describe('Purchasing', async () => {

    it('allows buying an artifact at 3 gwei per gaas', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0xB2D05E00', // 3 gwei
      ])

      await expect(mint.write.mint(
        [1n, 1n],
        { value: parseGwei((420000n * 3n).toString()) }
      )).to.emit(mint, 'NewMintPurchase')
        .withArgs(1n, parseGwei((42000n * 3n).toString()), 1n)
    })

    it('allows buying an artifact at 10 gwei per gas', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0x2540be400', // 10 gwei
      ])

      await expect(mint.write.mint(
        [1n, 1n],
        { value: parseGwei((42000n * 10n).toString()) }
      )).to.emit(mint, 'NewMintPurchase')
        .withArgs(1n, parseGwei((42000n * 10n).toString()), 1n)
    })

    it('allows buying multiple of an artifact', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0x2540be400', // 10 gwei
      ])

      await expect(mint.write.mint(
        [1n, 9n],
        { value: parseGwei((42000n * 10n * 9n).toString()) }
      )).to.emit(mint, 'NewMintPurchase')
        .withArgs(1n, parseGwei((42000n * 10n).toString()), 9n)
    })

    it('prevents buying an artifact at 10 gwei per gas for less than the set price', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0x2540be400', // 10 gwei
      ])

      await expect(mint.write.mint(
        [1n, 1n],
        { value: parseGwei((42000n * 9n).toString()) }
      )).to.be.revertedWithCustomError(mint, 'MintPriceNotMet')
    })

    it('prevents buying many of an artifact and not paying for the amount', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0x2540be400', // 10 gwei
      ])

      await expect(mint.write.mint(
        [1n, 10n],
        { value: parseGwei((42000n * 10n * 9n).toString()) }
      )).to.be.revertedWithCustomError(mint, 'MintPriceNotMet')
    })

    it('prevents buying an artifact after the mint has closed', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await mine(7200n)

      await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0x2540be400', // 10 gwei
      ])

      await expect(mint.write.mint(
        [1n, 1n],
        { value: parseGwei((42000n * 10n).toString()) }
      )).to.be.revertedWithCustomError(mint, 'MintClosed')
    })

    it('lets anyone buy a token', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0x2540be400', // 10 gwei
      ])

      await mint.write.mint(
        [1n, 10n],
        {
          value: parseGwei((42000n * 10n * 10n).toString()),
          account: JALIL,
        },
      )

      await expect(mint.write.mint(
        [1n, 10n],
        {
          value: parseGwei((42000n * 10n * 10n).toString()),
          account: JALIL,
        },
      )).to.be.fulfilled
    })

  })

  describe('Reading', async () => {

    it('shows the correct token URI', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      const dataURI = await mint.read.uri([1n])
      const json = Buffer.from(dataURI.substring(29), `base64`).toString()
      const data = JSON.parse(json)

      expect(data.name).to.equal(`VVM1`)
      expect(data.description).to.equal(`Lorem Ipsum dolor sit amet.`)
      expect(data.image).to.equal(TOKEN_TIME)
    })

    it('shows the correct token owner / balance', async () => {
      const { mint, owner } = await loadFixture(itemMintedFixture)

      expect(await mint.read.balanceOf([owner.account.address, 1n])).to.equal(1n)
      expect(await mint.read.balanceOf([JALIL, 1n])).to.equal(0n)

      await mint.write.safeTransferFrom([owner.account.address, JALIL, 1n, 1n, ''])

      expect(await mint.read.balanceOf([JALIL, 1n])).to.equal(1n)
    })

  })
})
