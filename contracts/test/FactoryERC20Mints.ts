import { getAddress, parseUnits } from 'viem'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { expect } from 'chai'
import hre from 'hardhat'
import { toByteArray } from '@visualizevalue/mint-utils'
import { ICON } from './constants'

describe('FactoryERC20Mints', function () {
  // Deploy the factory and dependencies
  async function factoryERC20MintsFixture() {
    const [owner, user1] = await hre.viem.getWalletClients()

    // Ensure we have sufficient balance
    const testClient = await hre.viem.getTestClient()
    await testClient.setBalance({
      address: owner.account.address,
      value: parseUnits('100', 18),
    })
    await testClient.setBalance({
      address: user1.account.address,
      value: parseUnits('100', 18),
    })

    // Deploy libraries
    const contractMetadata = await hre.viem.deployContract('ContractMetadata')

    // Deploy a renderer
    const renderer = await hre.viem.deployContract('MockRenderer')

    // Deploy the factory
    const factoryERC20Mints = await hre.viem.deployContract('FactoryERC20Mints', [renderer.address], {
      libraries: {
        ContractMetadata: contractMetadata.address,
      },
    })

    // Deploy mock ERC20 token
    const usdc = await hre.viem.deployContract('MockERC20', ['USD Coin', 'USDC', 6])

    // Mint tokens to user for testing
    await usdc.write.mint([user1.account.address, parseUnits('1000', 6)])

    return {
      factoryERC20Mints,
      renderer,
      contractMetadata,
      usdc,
      owner,
      user1,
      publicClient: await hre.viem.getPublicClient(),
    }
  }

  it('exposes the factory version', async function () {
    const { factoryERC20Mints } = await loadFixture(factoryERC20MintsFixture)

    expect(await factoryERC20Mints.read.version()).to.equal(1n)
  })

  it('creates a new MintViaERC20 contract', async function () {
    const { factoryERC20Mints, publicClient } = await loadFixture(factoryERC20MintsFixture)

    const hash = await factoryERC20Mints.write.create([
      'VV Mints ERC20',
      'VVERC20',
      'A collection that accepts ERC20 tokens as payment.',
      toByteArray(ICON),
    ])

    await publicClient.waitForTransactionReceipt({ hash })

    // Check that the Created event was emitted
    const createdEvents = await factoryERC20Mints.getEvents.Created()
    expect(createdEvents.length).to.equal(1)
    expect(createdEvents[0].args.contractAddress).to.not.equal(undefined)

    // Get the created contract
    const mintViaERC20 = await hre.viem.getContractAt('MintViaERC20', createdEvents[0].args.contractAddress as `0x${string}`)

    // Verify the contract was initialized properly
    const contractURI = await mintViaERC20.read.contractURI()
    const json = Buffer.from(contractURI.substring(29), 'base64').toString()
    const data = JSON.parse(json)

    expect(data.name).to.equal('VV Mints ERC20')
    expect(data.symbol).to.equal('VVERC20')
    expect(data.description).to.equal('A collection that accepts ERC20 tokens as payment.')
  })

  it('tracks collections created by each creator', async function () {
    const { factoryERC20Mints, owner, user1, publicClient } = await loadFixture(factoryERC20MintsFixture)

    // Create a collection as owner
    let hash = await factoryERC20Mints.write.create([
      'Owner Collection',
      'OWN',
      'Collection created by the owner',
      toByteArray(ICON),
    ])
    await publicClient.waitForTransactionReceipt({ hash })

    // Create a collection as user1
    hash = await factoryERC20Mints.write.create([
      'User Collection',
      'USR',
      'Collection created by a user',
      toByteArray(ICON),
    ], {
      account: user1.account
    })
    await publicClient.waitForTransactionReceipt({ hash })

    // Check collections for owner
    const ownerCollections = await factoryERC20Mints.read.getCreatorCollections([owner.account.address])
    expect(ownerCollections.length).to.equal(1)

    // Check collections for user1
    const userCollections = await factoryERC20Mints.read.getCreatorCollections([user1.account.address])
    expect(userCollections.length).to.equal(1)

    // Ensure the collections are different
    expect(ownerCollections[0]).to.not.equal(userCollections[0])
  })

  it('mints tokens in the created MintViaERC20 contract', async function () {
    const { factoryERC20Mints, usdc, owner, user1, publicClient } = await loadFixture(factoryERC20MintsFixture)

    // Create a collection as owner
    const hash = await factoryERC20Mints.write.create([
      'Test Collection',
      'TEST',
      'Collection for testing minting',
      toByteArray(ICON),
    ])
    await publicClient.waitForTransactionReceipt({ hash })
    const createdEvents = await factoryERC20Mints.getEvents.Created()
    const mintViaERC20 = await hre.viem.getContractAt('MintViaERC20', createdEvents[0].args.contractAddress as `0x${string}`)

    // Owner creates a token with USDC payment in the created contract
    await mintViaERC20.write.create([
      'Test Token',
      'A token requiring USDC payment',
      toByteArray(ICON),
      0,
      0n,
      usdc.address,
      parseUnits('10', 6), // 10 USDC
    ])

    // User approves USDC spending
    await usdc.write.approve([mintViaERC20.address, parseUnits('10', 6)], {
      account: user1.account,
    })

    // User mints the token
    await mintViaERC20.write.mint([1n, 1n], {
      account: user1.account,
    })

    // Verify user received the token
    expect(await mintViaERC20.read.balanceOf([user1.account.address, 1n])).to.equal(1n)

    // Verify USDC was transferred
    expect(await usdc.read.balanceOf([mintViaERC20.address])).to.equal(parseUnits('10', 6))
  })

  it('creates multiple collections for the same creator', async function () {
    const { factoryERC20Mints, owner, publicClient } = await loadFixture(factoryERC20MintsFixture)

    // Create first collection
    let hash = await factoryERC20Mints.write.create([
      'Collection 1',
      'COL1',
      'First collection',
      toByteArray(ICON),
    ])
    await publicClient.waitForTransactionReceipt({ hash })

    // Create second collection
    hash = await factoryERC20Mints.write.create([
      'Collection 2',
      'COL2',
      'Second collection',
      toByteArray(ICON),
    ])
    await publicClient.waitForTransactionReceipt({ hash })

    // Create third collection
    hash = await factoryERC20Mints.write.create([
      'Collection 3',
      'COL3',
      'Third collection',
      toByteArray(ICON),
    ])
    await publicClient.waitForTransactionReceipt({ hash })

    // Verify all collections are recorded
    const collections = await factoryERC20Mints.read.getCreatorCollections([owner.account.address])
    expect(collections.length).to.equal(3)

    // Verify each collection has unique address
    expect(collections[0]).to.not.equal(collections[1])
    expect(collections[1]).to.not.equal(collections[2])
    expect(collections[0]).to.not.equal(collections[2])
  })
})
