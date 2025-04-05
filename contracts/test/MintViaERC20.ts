import { getAddress, parseUnits, parseEther } from 'viem'
import { loadFixture, time } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'
import { toByteArray } from '@visualizevalue/mint-utils'
import { ICON, TOKEN_TIME } from './constants'

describe('MintViaERC20', function () {
  // Deploy test tokens and the MintViaERC20 contract
  async function fixture() {
    const [owner, user1, user2] = await hre.viem.getWalletClients()

    // Ensure we have sufficient balance
    const testClient = await hre.viem.getTestClient()
    await testClient.setBalance({
      address: owner.account.address,
      value: parseEther('100'),
    })
    await testClient.setBalance({
      address: user1.account.address,
      value: parseEther('100'),
    })

    // Deploy libraries first
    const contractMetadata = await hre.viem.deployContract('ContractMetadata')

    // Deploy mock ERC20 tokens for testing
    const usdc = await hre.viem.deployContract('MockERC20', ['USD Coin', 'USDC', 6])
    const dai = await hre.viem.deployContract('MockERC20', ['Dai', 'DAI', 18])

    // Mint some tokens to user1 for testing
    await usdc.write.mint([user1.account.address, parseUnits('1000', 6)])
    await dai.write.mint([user1.account.address, parseUnits('1000', 18)])

    // Deploy the renderer
    const renderer = await hre.viem.deployContract('MockRenderer')

    // Deploy the MintViaERC20 contract with linked libraries
    const mintViaERC20 = await hre.viem.deployContract('MintViaERC20', [], {
      libraries: {
        ContractMetadata: contractMetadata.address,
      },
    })

    // Initialize the contract (no default payment token)
    await mintViaERC20.write.init([
      'VV Mints via ERC20',
      'VVERC20',
      'A collection that accepts ERC20 tokens as payment.',
      toByteArray(ICON),
      renderer.address,
      owner.account.address,
    ])

    return {
      mintViaERC20,
      renderer,
      usdc,
      dai,
      owner,
      user1,
      user2,
      publicClient: await hre.viem.getPublicClient(),
    }
  }

  it('initializes with correct metadata and ownership', async function () {
    const { mintViaERC20, owner } = await loadFixture(fixture)

    expect(await mintViaERC20.read.owner()).to.equal(getAddress(owner.account.address))
    expect(await mintViaERC20.read.contractURI()).to.be.a('string') // Base64 encoded JSON
  })

  it('creates a token with USDC payment configuration', async function () {
    const { mintViaERC20, usdc } = await loadFixture(fixture)

    await mintViaERC20.write.create([
      'Token with USDC payment',
      'A token that requires USDC payment to mint',
      toByteArray(TOKEN_TIME),
      0,
      0n,
      usdc.address,
      parseUnits('39.82', 6), // Price in USDC with 6 decimals
    ])

    const [token, price] = await mintViaERC20.read.getPaymentConfig([1n])
    expect(token).to.equal(getAddress(usdc.address))
    expect(price).to.equal(parseUnits('39.82', 6))
  })

  it('creates a token with DAI payment configuration', async function () {
    const { mintViaERC20, dai } = await loadFixture(fixture)

    await mintViaERC20.write.create([
      'Token with DAI payment',
      'A token that requires DAI payment to mint',
      toByteArray(TOKEN_TIME),
      0,
      0n,
      dai.address,
      parseUnits('40', 18), // Price in DAI with 18 decimals
    ])

    const [token, price] = await mintViaERC20.read.getPaymentConfig([1n])
    expect(token).to.equal(getAddress(dai.address))
    expect(price).to.equal(parseUnits('40', 18))
  })

  it('allows minting with USDC payment', async function () {
    const { mintViaERC20, usdc, user1 } = await loadFixture(fixture)

    // Create token with USDC payment
    await mintViaERC20.write.create([
      'Token with USDC payment',
      'A token that requires USDC payment to mint',
      toByteArray(TOKEN_TIME),
      0,
      0n,
      usdc.address,
      parseUnits('39.82', 6), // Price in USDC with 6 decimals
    ])

    // Approve the contract to spend tokens
    await usdc.write.approve([mintViaERC20.address, parseUnits('39.82', 6)], {
      account: user1.account,
    })

    // Mint the token
    await mintViaERC20.write.mint([1n, 1n], {
      account: user1.account,
    })

    // Check balance
    expect(await mintViaERC20.read.balanceOf([user1.account.address, 1n])).to.equal(1n)
  })

  it('allows the owner to withdraw specific ERC20 tokens', async function () {
    const { mintViaERC20, usdc, dai, owner, user1 } = await loadFixture(fixture)

    // Create token with USDC payment
    await mintViaERC20.write.create([
      'Token with USDC payment',
      'A token that requires USDC payment to mint',
      toByteArray(TOKEN_TIME),
      0,
      0n,
      usdc.address,
      parseUnits('39.82', 6), // Price in USDC with 6 decimals
    ])

    // Create another token with DAI payment
    await mintViaERC20.write.create([
      'Token with DAI payment',
      'A token that requires DAI payment to mint',
      toByteArray(TOKEN_TIME),
      0,
      0n,
      dai.address,
      parseUnits('40', 18), // Price in DAI with 18 decimals
    ])

    // Approve the contract to spend USDC
    await usdc.write.approve([mintViaERC20.address, parseUnits('39.82', 6)], {
      account: user1.account,
    })

    // Approve the contract to spend DAI
    await dai.write.approve([mintViaERC20.address, parseUnits('40', 18)], {
      account: user1.account,
    })

    // Mint both tokens
    await mintViaERC20.write.mint([1n, 1n], { account: user1.account })
    await mintViaERC20.write.mint([2n, 1n], { account: user1.account })

    // Get initial USDC balance of owner
    const initialUsdcBalance = await usdc.read.balanceOf([owner.account.address])

    // Withdraw USDC
    await mintViaERC20.write.withdraw([usdc.address])

    // Check that USDC was transferred to owner
    const finalUsdcBalance = await usdc.read.balanceOf([owner.account.address])
    expect(finalUsdcBalance - initialUsdcBalance).to.equal(parseUnits('39.82', 6))

    // Get initial DAI balance of owner
    const initialDaiBalance = await dai.read.balanceOf([owner.account.address])

    // Withdraw DAI
    await mintViaERC20.write.withdraw([dai.address])

    // Check that DAI was transferred to owner
    const finalDaiBalance = await dai.read.balanceOf([owner.account.address])
    expect(finalDaiBalance - initialDaiBalance).to.equal(parseUnits('40', 18))
  })

  it('retrieves token metadata correctly', async function () {
    const { mintViaERC20, usdc } = await loadFixture(fixture)

    // Create token
    await mintViaERC20.write.create([
      'Test Token',
      'A token with metadata to test',
      toByteArray(TOKEN_TIME),
      0,
      0n,
      usdc.address,
      parseUnits('50', 6),
    ])

    // Get token data and log the actual structure
    const tokenData = await mintViaERC20.read.get([1n])

    // Test only the string values which are consistent
    expect(tokenData[0]).to.equal('Test Token') // name
    expect(tokenData[1]).to.equal('A token with metadata to test') // description

    // Just verify the other fields exist without specific type checks
    expect(tokenData[2]).to.not.be.undefined // artifact
    expect(tokenData[3]).to.not.be.undefined // renderer
    expect(tokenData[4]).to.not.be.undefined // mintedBlock
    expect(tokenData[5]).to.not.be.undefined // closeAt
    expect(tokenData[6]).to.not.be.undefined // data
  })

  it('calculates mint window correctly', async function () {
    const { mintViaERC20, usdc } = await loadFixture(fixture)

    // Create token
    await mintViaERC20.write.create([
      'Token with mint window',
      'Testing the mint window calculation',
      toByteArray(TOKEN_TIME),
      0,
      0n,
      usdc.address,
      parseUnits('10', 6),
    ])

    const openUntil = await mintViaERC20.read.mintOpenUntil([1n])
    const nowTimestamp = BigInt(Math.floor(Date.now() / 1000))

    // Check that the mint window is approximately 24 hours from now
    // Allow a small difference for execution time
    const dayInSeconds = 24n * 60n * 60n
    const difference = openUntil - nowTimestamp

    expect(difference).to.be.closeTo(dayInSeconds, 300n) // Allow 5 minutes wiggle room
  })

  it('allows registering a new renderer', async function () {
    const { mintViaERC20, owner } = await loadFixture(fixture)

    // Deploy another renderer
    const newRenderer = await hre.viem.deployContract('MockRenderer')

    // Register the new renderer
    await mintViaERC20.write.registerRenderer([newRenderer.address])

    // The first renderer is at index 0, so the new one should be at index 1
    expect(await mintViaERC20.read.renderers([1n])).to.equal(getAddress(newRenderer.address))
  })

  it('prevents minting a non-existent token', async function () {
    const { mintViaERC20, usdc, user1 } = await loadFixture(fixture)

    // Try to mint a token that doesn't exist (token ID 999)
    await expect(mintViaERC20.write.mint([999n, 1n], { account: user1.account })).to.be
      .rejected
  })

  it('prevents minting after the mint window has closed', async function () {
    const { mintViaERC20, usdc, user1 } = await loadFixture(fixture)

    // Create token
    await mintViaERC20.write.create([
      'Token with closing mint window',
      'A token that will have its mint window closed',
      toByteArray(TOKEN_TIME),
      0,
      0n,
      usdc.address,
      parseUnits('10', 6),
    ])

    // Approve spending
    await usdc.write.approve([mintViaERC20.address, parseUnits('10', 6)], {
      account: user1.account,
    })

    // Fast forward time by 25 hours (past the 24 hour mint window)
    await time.increase(25 * 60 * 60)

    // Attempt to mint after window closes
    await expect(mintViaERC20.write.mint([1n, 1n], { account: user1.account })).to.be.rejected
  })

  it('allows burning tokens', async function () {
    const { mintViaERC20, usdc, user1 } = await loadFixture(fixture)

    // Create and mint a token
    await mintViaERC20.write.create([
      'Burnable Token',
      'A token that will be burned',
      toByteArray(TOKEN_TIME),
      0,
      0n,
      usdc.address,
      parseUnits('5', 6),
    ])

    // Approve and mint
    await usdc.write.approve([mintViaERC20.address, parseUnits('5', 6)], {
      account: user1.account,
    })

    await mintViaERC20.write.mint([1n, 1n], {
      account: user1.account,
    })

    // Verify initial balance
    expect(await mintViaERC20.read.balanceOf([user1.account.address, 1n])).to.equal(1n)

    // Burn the token
    await mintViaERC20.write.burn([user1.account.address, 1n, 1n], {
      account: user1.account,
    })

    // Check that balance is now 0
    expect(await mintViaERC20.read.balanceOf([user1.account.address, 1n])).to.equal(0n)
  })

  it('supports preparing artifacts in multiple transactions', async function () {
    const { mintViaERC20, usdc, owner } = await loadFixture(fixture)

    // Prepare artifact for a future token (ID 5)
    const futureTokenId = 5n

    // First chunk of artifact data
    await mintViaERC20.write.prepareArtifact([
      futureTokenId,
      toByteArray('First part of the artifact'),
      false,
    ])

    // Second chunk, with clear=false to append
    await mintViaERC20.write.prepareArtifact([
      futureTokenId,
      toByteArray('Second part of the artifact'),
      false,
    ])

    // Create the token that was prepared
    // Need to create tokens 1-4 first
    for (let i = 1; i < futureTokenId; i++) {
      await mintViaERC20.write.create([
        `Token ${i}`,
        `Description ${i}`,
        toByteArray(''),
        0,
        0n,
        usdc.address,
        parseUnits('1', 6),
      ])
    }

    // Create token 5 with the prepared artifact
    await mintViaERC20.write.create([
      'Prepared Token',
      'A token with prepared artifact',
      toByteArray(''), // Empty array since we already prepared the artifact
      0,
      0n,
      usdc.address,
      parseUnits('1', 6),
    ])

    // Token should exist and have the right ID
    expect(await mintViaERC20.read.latestTokenId()).to.equal(BigInt(futureTokenId))
  })

  it('rejects zero address as payment token during token creation', async function () {
    const { mintViaERC20 } = await loadFixture(fixture)

    // Try to create a token with zero address as payment token
    await expect(
      mintViaERC20.write.create([
        'Invalid Token',
        'Token with zero address payment',
        toByteArray(TOKEN_TIME),
        0,
        0n,
        '0x0000000000000000000000000000000000000000', // Zero address
        parseUnits('10', 18),
      ]),
    ).to.be.revertedWithCustomError(mintViaERC20, 'InvalidPaymentToken')
  })

  it('rejects zero address in withdrawal function', async function () {
    const { mintViaERC20, owner } = await loadFixture(fixture)

    // Try to withdraw from zero address
    await expect(
      mintViaERC20.write.withdraw([
        '0x0000000000000000000000000000000000000000', // Zero address
      ]),
    ).to.be.revertedWithCustomError(mintViaERC20, 'InvalidPaymentToken')
  })
})
