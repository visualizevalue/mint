import { getAddress, parseUnits } from 'viem'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'
import { toByteArray } from '@visualizevalue/mint-utils'
import { ICON, TOKEN_TIME } from './constants'

describe('MintViaERC20', function () {
  // Deploy test tokens and the MintViaERC20 contract
  async function fixture() {
    const [owner, user1, user2] = await hre.viem.getWalletClients()
    
    // Deploy mock ERC20 tokens for testing
    const usdc = await hre.viem.deployContract('MockERC20', ['USD Coin', 'USDC', 6])
    const dai = await hre.viem.deployContract('MockERC20', ['Dai', 'DAI', 18])
    
    // Mint some tokens to user1 for testing
    await usdc.write.mint([user1.account.address, parseUnits('1000', 6)])
    await dai.write.mint([user1.account.address, parseUnits('1000', 18)])
    
    // Deploy the renderer
    const renderer = await hre.viem.deployContract('MockRenderer')
    
    // Deploy the MintViaERC20 contract
    const mintViaERC20 = await hre.viem.deployContract('MintViaERC20')
    
    // Initialize the contract (no default payment token)
    await mintViaERC20.write.init([
      'VV Mints via ERC20',
      'VVERC20',
      'A collection that accepts ERC20 tokens as payment.',
      [toByteArray(ICON)],
      renderer.address,
      owner.account.address
    ])
    
    return {
      mintViaERC20,
      renderer,
      usdc,
      dai,
      owner,
      user1,
      user2,
      publicClient: await hre.viem.getPublicClient()
    }
  }

  it('initializes with correct metadata', async function () {
    const { mintViaERC20, owner } = await loadFixture(fixture)
    
    expect(await mintViaERC20.read.owner()).to.equal(getAddress(owner.account.address))
    expect(await mintViaERC20.read.contractURI()).to.include('VV Mints via ERC20')
  })

  it('creates a token with USDC payment configuration', async function () {
    const { mintViaERC20, usdc } = await loadFixture(fixture)
    
    await mintViaERC20.write.create([
      'Token with USDC payment',
      'A token that requires USDC payment to mint',
      [toByteArray(TOKEN_TIME)],
      0,
      0,
      usdc.address,
      parseUnits('39.82', 6) // Price in USDC with 6 decimals
    ])
    
    const [token, price] = await mintViaERC20.read.getPaymentConfig([1])
    expect(token).to.equal(getAddress(usdc.address))
    expect(price).to.equal(parseUnits('39.82', 6))
  })
  
  it('creates a token with DAI payment configuration', async function () {
    const { mintViaERC20, dai } = await loadFixture(fixture)
    
    await mintViaERC20.write.create([
      'Token with DAI payment',
      'A token that requires DAI payment to mint',
      [toByteArray(TOKEN_TIME)],
      0,
      0,
      dai.address,
      parseUnits('40', 18) // Price in DAI with 18 decimals
    ])
    
    const [token, price] = await mintViaERC20.read.getPaymentConfig([1])
    expect(token).to.equal(getAddress(dai.address))
    expect(price).to.equal(parseUnits('40', 18))
  })
  
  it('allows minting with USDC payment', async function () {
    const { mintViaERC20, usdc, user1 } = await loadFixture(fixture)
    
    // Create token with USDC payment
    await mintViaERC20.write.create([
      'Token with USDC payment',
      'A token that requires USDC payment to mint',
      [toByteArray(TOKEN_TIME)],
      0,
      0,
      usdc.address,
      parseUnits('39.82', 6) // Price in USDC with 6 decimals
    ])
    
    // Approve the contract to spend tokens
    await usdc.write.approve([mintViaERC20.address, parseUnits('39.82', 6)], {
      account: user1.account
    })
    
    // Mint the token
    await mintViaERC20.write.mint([1, 1], {
      account: user1.account
    })
    
    // Check balance
    expect(await mintViaERC20.read.balanceOf([user1.account.address, 1])).to.equal(1n)
  })
  
  it('allows the owner to withdraw specific ERC20 tokens', async function () {
    const { mintViaERC20, usdc, dai, owner, user1 } = await loadFixture(fixture)
    
    // Create token with USDC payment
    await mintViaERC20.write.create([
      'Token with USDC payment',
      'A token that requires USDC payment to mint',
      [toByteArray(TOKEN_TIME)],
      0,
      0,
      usdc.address,
      parseUnits('39.82', 6) // Price in USDC with 6 decimals
    ])
    
    // Create another token with DAI payment
    await mintViaERC20.write.create([
      'Token with DAI payment',
      'A token that requires DAI payment to mint',
      [toByteArray(TOKEN_TIME)],
      0,
      0,
      dai.address,
      parseUnits('40', 18) // Price in DAI with 18 decimals
    ])
    
    // Approve the contract to spend USDC
    await usdc.write.approve([mintViaERC20.address, parseUnits('39.82', 6)], {
      account: user1.account
    })
    
    // Approve the contract to spend DAI
    await dai.write.approve([mintViaERC20.address, parseUnits('40', 18)], {
      account: user1.account
    })
    
    // Mint both tokens
    await mintViaERC20.write.mint([1, 1], { account: user1.account })
    await mintViaERC20.write.mint([2, 1], { account: user1.account })
    
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
})