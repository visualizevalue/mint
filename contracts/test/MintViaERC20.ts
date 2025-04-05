import { getAddress, parseUnits, zeroAddress } from 'viem'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'
import { toByteArray } from '@visualizevalue/mint-utils'
import { ICON, TOKEN_TIME } from './constants'

describe.only('MintViaERC20', function () {
  // Deploy a test ERC20 token and the MintViaERC20 contract
  async function fixture() {
    const [owner, user1, user2] = await hre.viem.getWalletClients()

    // Deploy a mock ERC20 token for testing
    const erc20 = await hre.viem.deployContract('MockERC20', ['USD Coin', 'USDC', 6])

    // Mint some tokens to user1 for testing
    await erc20.write.mint([user1.account.address, parseUnits('1000', 6)])

    // Deploy the renderer
    const renderer = await hre.viem.deployContract('MockRenderer')

    // Deploy the MintViaERC20 contract
    const mintViaERC20 = await hre.viem.deployContract('MintViaERC20')

    // Initialize the contract
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
      erc20,
      owner,
      user1,
      user2,
      publicClient: await hre.viem.getPublicClient(),
    }
  }

  it('initializes with correct metadata', async function () {
    const { mintViaERC20, owner } = await loadFixture(fixture)

    expect(await mintViaERC20.read.owner()).to.equal(getAddress(owner.account.address))
    expect(await mintViaERC20.read.contractURI()).to.include('VV Mints via ERC20')
  })

  it('creates a token with ETH payment', async function () {
    const { mintViaERC20, owner } = await loadFixture(fixture)

    await mintViaERC20.write.create([
      'Token with ETH payment',
      'A token that requires ETH payment to mint',
      toByteArray(TOKEN_TIME),
      0,
      0n,
    ])

    // Set a price in ETH
    await mintViaERC20.write.setPaymentConfig([1n, zeroAddress, parseUnits('0.1', 18)])

    const [paymentToken, price] = await mintViaERC20.read.getPaymentConfig([1n])
    expect(paymentToken).to.equal(zeroAddress)
    expect(price).to.equal(parseUnits('0.1', 18))
  })

  it('creates a token with ERC20 payment', async function () {
    const { mintViaERC20, erc20, owner } = await loadFixture(fixture)

    await mintViaERC20.write.createWithERC20Payment([
      'Token with USDC payment',
      'A token that requires USDC payment to mint',
      [toByteArray(TOKEN_TIME)],
      0,
      0,
      erc20.address,
      parseUnits('39.82', 6), // Price in USDC with 6 decimals
    ])

    const [paymentToken, price] = await mintViaERC20.read.getPaymentConfig([1])
    expect(paymentToken).to.equal(getAddress(erc20.address))
    expect(price).to.equal(parseUnits('39.82', 6))
  })

  it('allows minting with ETH payment', async function () {
    const { mintViaERC20, user1 } = await loadFixture(fixture)

    // Create token with ETH payment
    await mintViaERC20.write.create([
      'Token with ETH payment',
      'A token that requires ETH payment to mint',
      [toByteArray(TOKEN_TIME)],
      0,
      0,
    ])

    // Set a price in ETH
    await mintViaERC20.write.setPaymentConfig([1, zeroAddress, parseUnits('0.1', 18)])

    // Mint the token
    await mintViaERC20.write.mint([1, 1], {
      account: user1.account,
      value: parseUnits('0.1', 18),
    })

    // Check balance
    expect(await mintViaERC20.read.balanceOf([user1.account.address, 1])).to.equal(1n)
  })

  it('allows minting with ERC20 payment', async function () {
    const { mintViaERC20, erc20, user1 } = await loadFixture(fixture)

    // Create token with ERC20 payment
    await mintViaERC20.write.createWithERC20Payment([
      'Token with USDC payment',
      'A token that requires USDC payment to mint',
      [toByteArray(TOKEN_TIME)],
      0,
      0,
      erc20.address,
      parseUnits('39.82', 6), // Price in USDC with 6 decimals
    ])

    // Approve the contract to spend tokens
    await erc20.write.approve([mintViaERC20.address, parseUnits('39.82', 6)], {
      account: user1.account,
    })

    // Mint the token
    await mintViaERC20.write.mint([1, 1], {
      account: user1.account,
    })

    // Check balance
    expect(await mintViaERC20.read.balanceOf([user1.account.address, 1])).to.equal(1n)
  })

  it('allows the owner to withdraw ERC20 tokens', async function () {
    const { mintViaERC20, erc20, owner, user1 } = await loadFixture(fixture)

    // Create token with ERC20 payment
    await mintViaERC20.write.createWithERC20Payment([
      'Token with USDC payment',
      'A token that requires USDC payment to mint',
      [toByteArray(TOKEN_TIME)],
      0,
      0,
      erc20.address,
      parseUnits('39.82', 6), // Price in USDC with 6 decimals
    ])

    // Approve the contract to spend tokens
    await erc20.write.approve([mintViaERC20.address, parseUnits('39.82', 6)], {
      account: user1.account,
    })

    // Mint the token
    await mintViaERC20.write.mint([1, 1], {
      account: user1.account,
    })

    // Get initial balance of owner
    const initialBalance = await erc20.read.balanceOf([owner.account.address])

    // Withdraw tokens
    await mintViaERC20.write.withdrawERC20([erc20.address])

    // Check that tokens were transferred to owner
    const finalBalance = await erc20.read.balanceOf([owner.account.address])
    expect(finalBalance - initialBalance).to.equal(parseUnits('39.82', 6))
  })
})
