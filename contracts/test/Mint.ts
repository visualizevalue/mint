import { parseGwei } from 'viem'
import {
  loadFixture, mine
} from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { expect } from 'chai'
import { TOKEN_TIME } from './constants'
import hre from 'hardhat'
import { collectionFixture, itemMintedFixture } from './fixtures'

describe('Mint', () => {

  describe('Creating', async () => {

    it('create an onchain artifact', async () => {
      const { mint } = await loadFixture(collectionFixture)

      await expect(mint.write.create([
        'VVM1',
        // 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga laborum labore facilis culpa saepe voluptates enim neque distinctio id, voluptate consectetur, deserunt sequi quisquam. Dolorum mollitia repellat expedita in dolores!',
        'Lorem Ipsum dolor sit amet.',
        TOKEN_TIME,
        0n,
        0n,
      ])).to.emit(mint, 'NewMint').withArgs(1n)
    })

    it('create an offchain artifact', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await expect(mint.write.create([
        'VVM2',
        'Lorem Ipsum dolor sit amet.',
        'ipfs://qmy3zdkwrqnwqenczocdrr3xgqfxjxmgefup4htqenbvwo',
        0n,
        0n,
      ])).to.emit(mint, 'NewMint').withArgs(2n)
    })

  })

  describe('Purchasing', async () => {

    it('allows buying an artifact at 3 gwei per gaas', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0x3', // 3 gwei
      ]);

      await expect(mint.write.mint(
        [1n, 1n],
        { value: parseGwei((420000n * 3n).toString()) }
      )).to.emit(mint, 'NewMintPurchase')
    })

    it('allows buying an artifact at 10 gwei per gas', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0x2540be400', // 10 gwei
      ]);

      await expect(mint.write.mint(
        [1n, 1n],
        { value: parseGwei((42000n * 10n).toString()) }
      )).to.emit(mint, 'NewMintPurchase')
    })

    it('prevents buying an artifact at 10 gwei per gas for less than the set price', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0x2540be400', // 10 gwei
      ]);

      await expect(mint.write.mint(
        [1n, 1n],
        { value: parseGwei((42000n * 9n).toString()) }
      )).to.be.revertedWithCustomError(mint, 'MintPriceNotMet')
    })

    it('prevents buying an artifact after the mint has closed', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await mine(7200n)

      await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0x2540be400', // 10 gwei
      ]);

      await expect(mint.write.mint(
        [1n, 1n],
        { value: parseGwei((42000n * 10n).toString()) }
      )).to.be.revertedWithCustomError(mint, 'MintClosed')
    })

  })
})
