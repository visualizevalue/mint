import { getAddress, fromHex, parseGwei, zeroAddress } from 'viem'
import hre from 'hardhat'
import { loadFixture, mine, time } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { toByteArray, encodeTokenMetadata } from '@visualizevalue/mint-utils'
import { expect } from 'chai'
import { JALIL, TOKEN_TIME } from './constants'
import { collectionFixture, itemMintedFixture, itemPreparedFixture } from './fixtures'

describe('Mint', () => {

  describe('Creating', async () => {

    it('create an onchain artifact', async () => {
      const { mint, owner } = await loadFixture(collectionFixture)

      const address = getAddress(owner.account.address)

      await expect(mint.write.create([
        encodeTokenMetadata(
          'VVM1',
          'Lorem Ipsum dolor sit amet.'
        ),
        toByteArray(TOKEN_TIME),
        0,
        0n,
      ])).to.emit(mint, 'TransferSingle').withArgs(address, zeroAddress, address, 1n, 1n)
    })

    it('create an offchain artifact', async () => {
      const { mint, owner } = await loadFixture(collectionFixture)

      const address = getAddress(owner.account.address)

      await expect(mint.write.create([
        encodeTokenMetadata(
          'VVM1',
          'Lorem Ipsum dolor sit amet.'
        ),
        toByteArray('ipfs://qmy3zdkwrqnwqenczocdrr3xgqfxjxmgefup4htqenbvwo'),
        0,
        0n,
      ])).to.emit(mint, 'TransferSingle').withArgs(address, zeroAddress, address, 1n, 1n)
    })

    it('mints tokens with incremental token IDs', async () => {
      const { mint, owner } = await loadFixture(itemMintedFixture)

      const address = getAddress(owner.account.address)

      await expect(mint.write.create([
        encodeTokenMetadata(
          'VVM2',
          'Lorem Ipsum dolor sit amet.'
        ),
        toByteArray('ipfs://qmy3zdkwrqnwqenczocdrr3xgqfxjxmgefup4htqenbvwo'),
        0,
        0n,
      ])).to.emit(mint, 'TransferSingle').withArgs(address, zeroAddress, address, 2n, 1n)
    })

    it('mints the first token to the artist', async () => {
      const { mint, owner } = await loadFixture(itemMintedFixture)

      expect(await mint.read.balanceOf([owner.account.address, 1n])).to.equal(1n)
    })

    it('prevents anyone but the contract owner to create an artifact', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await expect(mint.write.create(
        [
          encodeTokenMetadata(
            'VVM2',
            'Lorem Ipsum dolor sit amet.'
          ),
          toByteArray('ipfs://qmy3zdkwrqnwqenczocdrr3xgqfxjxmgefup4htqenbvwo'),
          0,
          0n,
        ],
        { account: JALIL }
      )).to.be.revertedWithCustomError(mint, 'OwnableUnauthorizedAccount')
    })

    it('prepare a large artifact across multiple transactions', async () => {
      const { mint, largeArtifact } = await loadFixture(itemPreparedFixture)

      await mint.write.create([ encodeTokenMetadata('PREPARED', ''), toByteArray(''), 0, 0n ])

      // @ts-ignore
      const dataURI = await mint.read.uri([2n], { gas: 1_000_000_000 })
      const json = Buffer.from(dataURI.substring(29), `base64`).toString()
      const data = JSON.parse(json)

      expect(data.image).to.equal(largeArtifact)
    })

    it('prepare a large artifact across multiple transactions and clear previous artifact', async () => {
      const { mint } = await loadFixture(itemPreparedFixture)

      await expect(mint.write.prepareArtifact(
        [
          2n,
          toByteArray('Hello world'),
          true,
        ],
      )).to.be.fulfilled

      await mint.write.create([ encodeTokenMetadata('PREPARED', ''), toByteArray(''), 0, 0n ])

      const dataURI = await mint.read.uri([2n]) as string
      const json = Buffer.from(dataURI.substring(29), `base64`).toString()
      const data = JSON.parse(json)

      expect(data.image).to.equal('Hello world')
    })

    it('creates a token and overrieds previously prepared artifact', async () => {
      const { mint } = await loadFixture(itemPreparedFixture)

      await expect(mint.write.create(
        [
          encodeTokenMetadata(
            'VVM2',
            'Lorem Ipsum dolor sit amet.'
          ),
          toByteArray('ipfs://qmy3zdkwrqnwqenczocdrr3xgqfxjxmgefup4htqenbvwo'),
          0,
          0n,
        ]
      )).to.be.fulfilled

      const dataURI = await mint.read.uri([2n])
      const json = Buffer.from(dataURI.substring(29), `base64`).toString()
      const data = JSON.parse(json)

      expect(data.image).to.equal('ipfs://qmy3zdkwrqnwqenczocdrr3xgqfxjxmgefup4htqenbvwo')
    })

    it('creates a token with a previously prepared artifact', async () => {
      const { mint, largeArtifact } = await loadFixture(itemPreparedFixture)

      await expect(mint.write.create(
        [
          encodeTokenMetadata(
            'VVM2',
            'Lorem Ipsum dolor sit amet.'
          ),
          [],
          0,
          0n,
        ]
      )).to.be.fulfilled

      // @ts-ignore
      const dataURI = await mint.read.uri([2n], { gas: 1_000_000_000 })
      const json = Buffer.from(dataURI.substring(29), `base64`).toString()
      const data = JSON.parse(json)

      expect(data.image).to.equal(largeArtifact)
    })

    it('prevents adding to artifact after token creation', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await expect(mint.write.prepareArtifact(
        [
          1n,
          toByteArray('Hello world'),
          true,
        ],
      )).to.be.revertedWithCustomError(mint, 'TokenAlreadyMinted')
    })

    it('allows registering (and using) a new renderer', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      const mockRenderer = await hre.viem.deployContract('MockRenderer', [])

      await expect(mint.write.registerRenderer([mockRenderer.address]))
        .to.emit(mint, 'NewRenderer')
        .withArgs(getAddress(mockRenderer.address), 1n)

      await expect(mint.write.create([
        encodeTokenMetadata('mock', ''),
        toByteArray('void'),
        1,
        19n,
      ])).to.be.fulfilled

      const dataURI = await mint.read.uri([2n])
      const json = Buffer.from(dataURI.substring(29), `base64`).toString()
      const data = JSON.parse(json)

      expect(data.foo).to.equal('bar')
      expect(data.data).to.equal('19')
    })

  })

  describe('Purchasing', async () => {

    it('allows buying an artifact at 3 gwei per gaas', async () => {
      const { mint, owner } = await loadFixture(itemMintedFixture)

      await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0xB2D05E00', // 3 gwei
      ])

      await expect(mint.write.mint(
        [1n, 1n],
        { value: parseGwei((60000n * 3n).toString()) }
      )).to.emit(mint, 'NewMint')
        .withArgs(1n, parseGwei((60000n * 3n).toString()), 1n, getAddress(owner.account.address))
    })

    it('allows buying an artifact at 10 gwei per gas', async () => {
      const { mint, owner } = await loadFixture(itemMintedFixture)

      await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0x2540be400', // 10 gwei
      ])

      await expect(mint.write.mint(
        [1n, 1n],
        { value: parseGwei((60000n * 10n).toString()) }
      )).to.emit(mint, 'NewMint')
        .withArgs(1n, parseGwei((60000n * 10n).toString()), 1n, getAddress(owner.account.address))
    })

    it('allows buying multiple of an artifact', async () => {
      const { mint, owner } = await loadFixture(itemMintedFixture)

      await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0x2540be400', // 10 gwei
      ])

      await expect(mint.write.mint(
        [1n, 9n],
        { value: parseGwei((60000n * 10n * 9n).toString()) }
      )).to.emit(mint, 'NewMint')
        .withArgs(1n, parseGwei((60000n * 10n).toString()), 9n, getAddress(owner.account.address))
    })

    it('prevents buying an artifact at 10 gwei per gas for less than the set price', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0x2540be400', // 10 gwei
      ])

      await expect(mint.write.mint(
        [1n, 1n],
        { value: parseGwei((60000n * 9n).toString()) }
      )).to.be.revertedWithCustomError(mint, 'MintPriceNotMet')
    })

    it('prevents buying many of an artifact and not paying for the amount', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0x2540be400', // 10 gwei
      ])

      await expect(mint.write.mint(
        [1n, 10n],
        { value: parseGwei((60000n * 10n * 9n).toString()) }
      )).to.be.revertedWithCustomError(mint, 'MintPriceNotMet')
    })

    it('prevents buying an artifact after the mint has closed', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await time.increase(86_400)

      // We mint another token in the meantime to make sure we're checking against the actual token creation
      await mint.write.create(
        [
          encodeTokenMetadata(
            'VVM2',
            'Lorem Ipsum dolor sit amet.'
          ),
          [],
          0,
          0n,
        ]
      )

      await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0x2540be400', // 10 gwei
      ])

      await expect(mint.write.mint(
        [1n, 1n],
        { value: parseGwei((60000n * 10n).toString()) }
      )).to.be.revertedWithCustomError(mint, 'MintClosed')
    })

    it('prevents buying non existent artifacts', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await expect(mint.write.mint(
        [9n, 1n],
        { value: parseGwei((60000n * 10n).toString()) }
      )).to.be.revertedWithCustomError(mint, 'NonExistentToken')
    })

    it('lets anyone buy a token', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0x2540be400', // 10 gwei
      ])

      await expect(mint.write.mint(
        [1n, 10n],
        {
          value: parseGwei((60000n * 10n * 10n).toString()),
          account: JALIL,
        },
      )).to.emit(mint, 'TransferSingle').withArgs(JALIL, zeroAddress, JALIL, 1n, 10n)
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

    it('calculates the mint end timestamp correctly', async () => {
      const { mint, publicClient } = await loadFixture(collectionFixture)

      const hash = await mint.write.create([ encodeTokenMetadata('FOO', ''), toByteArray('BAR'), 0, 0n ])
      await publicClient.waitForTransactionReceipt({ hash })

      const until = await mint.read.mintOpenUntil([await mint.read.latestTokenId()])
      const currentBlock = await publicClient.getBlock()

      expect(currentBlock.timestamp + 86_400n).to.equal(until)
    })

    it('shows the correct token owner / balance', async () => {
      const { mint, owner } = await loadFixture(itemMintedFixture)

      expect(await mint.read.balanceOf([owner.account.address, 1n])).to.equal(1n)
      expect(await mint.read.balanceOf([JALIL, 1n])).to.equal(0n)

      await mint.write.safeTransferFrom([owner.account.address, JALIL, 1n, 1n, zeroAddress])

      expect(await mint.read.balanceOf([JALIL, 1n])).to.equal(1n)
    })

    it('throws on trying to retreive non existent tokens', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await expect(mint.read.uri([ 9n ])).to.be.revertedWithCustomError(mint, 'NonExistentToken')
    })

  })

  describe('Withdrawals', async () => {

    it('prevents non owners from withdrawing the contract balance', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0x2540be400', // 10 gwei
      ])

      const value = parseGwei((60000n * 10n * 10n).toString())

      await mint.write.mint(
        [1n, 10n],
        {
          value,
          account: JALIL,
        }
      )

      await expect(mint.write.withdraw({ account: JALIL }))
        .to.be.revertedWithCustomError(mint, 'OwnableUnauthorizedAccount')
    })

    it('allows owners to withdraw the contract balance', async () => {
      const { mint, owner } = await loadFixture(itemMintedFixture)

      await hre.network.provider.send('hardhat_setNextBlockBaseFeePerGas', [
        '0x2540be400', // 10 gwei
      ])

      const value = parseGwei((60000n * 10n * 10n).toString())

      await mint.write.mint(
        [1n, 10n],
        {
          value,
          account: JALIL,
        }
      )

      const tx = mint.write.withdraw({ account: owner.account })

      // await expect(tx).to.emit(mint, 'Withdrawal').withArgs(value)
      await expect(tx).to.changeEtherBalance(owner, value)
    })

  })

  describe('Ownership', async () => {

    it('exposes the owner of a collection', async () => {
      const { mint, owner } = await loadFixture(itemMintedFixture)

      expect((await mint.read.owner()).toLowerCase()).to.equal(owner.account.address)
    })

    it('prevents non owners to transfer ownership', async () => {
      const { mint } = await loadFixture(itemMintedFixture)

      await expect(mint.write.transferOwnership([JALIL], { account: JALIL }))
        .to.be.revertedWithCustomError(mint, 'OwnableUnauthorizedAccount')
    })

    it('allows owners to transfer ownership', async () => {
      const { mint, owner } = await loadFixture(itemMintedFixture)

      await expect(mint.write.transferOwnership([JALIL], { account: owner.account }))
        .to.emit(mint, 'OwnershipTransferStarted')


      await expect(mint.write.acceptOwnership({ account: JALIL }))
        .to.emit(mint, 'OwnershipTransferred')
    })

  })

})
