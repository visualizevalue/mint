import { parseEther } from 'viem'
import {
  loadFixture,
} from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import hre from 'hardhat'
import { ICON, JALIL, TOKEN_TIME } from './constants'

export async function factoryFixture() {
  const [owner] = await hre.viem.getWalletClients()

  const testClient = await hre.viem.getTestClient()
  await testClient.impersonateAccount({ address: JALIL })
  await owner.sendTransaction({ to: JALIL, value: parseEther('1') })

  const contractMetadata = await hre.viem.deployContract('ContractMetadata', [])

  const factory = await hre.viem.deployContract('Factory', [], {
    libraries: {
      ContractMetadata: contractMetadata.address,
    }
  })

  const publicClient = await hre.viem.getPublicClient()

  return {
    factory,
    owner,
    publicClient,
  }
}

export async function libraryFactoryFixture() {
  const [owner] = await hre.viem.getWalletClients()

  const testClient = await hre.viem.getTestClient()
  await testClient.impersonateAccount({ address: JALIL })
  await owner.sendTransaction({ to: JALIL, value: parseEther('1') })

  const erc1155 = await hre.viem.deployContract('contracts/libraries/ERC1155.sol:ERC1155', [])
  const contractMetadata = await hre.viem.deployContract('contracts/libraries/ContractMetadata.sol:ContractMetadata', [])

  const factory = await hre.viem.deployContract('FactoryMintLibrary', [], {
    libraries: {
      ERC1155: erc1155.address,
      ContractMetadata: contractMetadata.address,
    }
  })

  const publicClient = await hre.viem.getPublicClient()

  return {
    factory,
    owner,
    publicClient,
  }
}

export async function cloneFactoryFixture() {
  const [owner] = await hre.viem.getWalletClients()

  const testClient = await hre.viem.getTestClient()
  await testClient.impersonateAccount({ address: JALIL })
  await owner.sendTransaction({ to: JALIL, value: parseEther('1') })

  const contractMetadata = await hre.viem.deployContract('ContractMetadata', [])

  const factory = await hre.viem.deployContract('CloneFactory', [], {
    libraries: {
      ContractMetadata: contractMetadata.address,
    }
  })

  const publicClient = await hre.viem.getPublicClient()

  return {
    factory,
    owner,
    publicClient,
  }
}

export async function collectionFixture() {
  const { factory, owner, publicClient } = await loadFixture(factoryFixture)

  const renderer = await hre.viem.deployContract('Renderer', [])

  const hash = await factory.write.create([
    'VV Mints',
    'VVM',
    'Lorem Ipsum dolor sit amet.',
    ICON,
  ])
  await publicClient.waitForTransactionReceipt({ hash })
  const createdEvents = await factory.getEvents.Created()
  const mint = await hre.viem.getContractAt('Mint', createdEvents[0].args.contractAddress)

  await mint.write.registerRenderer([renderer.address])

  return {
    mint,
    factory,
    owner,
    publicClient,
  }
}

export async function libraryCollectionFixture() {
  const { factory, owner, publicClient } = await loadFixture(libraryFactoryFixture)

  const renderer = await hre.viem.deployContract('Renderer', [])

  const hash = await factory.write.create([
    'VV Mints',
    'VVM',
    'Lorem Ipsum dolor sit amet.',
    ICON,
  ])
  await publicClient.waitForTransactionReceipt({ hash })
  const createdEvents = await factory.getEvents.Created()
  const mint = await hre.viem.getContractAt('MintViaLibrary', createdEvents[0].args.contractAddress)

  await mint.write.registerRenderer([renderer.address])

  return {
    mint,
    factory,
    owner,
    publicClient,
  }
}

export async function cloneCollectionFixture() {
  const { factory, owner, publicClient } = await loadFixture(cloneFactoryFixture)

  const renderer = await hre.viem.deployContract('Renderer', [])

  const hash = await factory.write.create([
    'VV Mints',
    'VVM',
    'Lorem Ipsum dolor sit amet.',
    ICON,
  ])
  await publicClient.waitForTransactionReceipt({ hash })
  const createdEvents = await factory.getEvents.Created()
  const mint = await hre.viem.getContractAt('MintClonable', createdEvents[0].args.contractAddress)

  await mint.write.registerRenderer([renderer.address])

  return {
    mint,
    factory,
    owner,
    publicClient,
  }
}

export async function itemMintedFixture() {
  const { mint, factory, owner, publicClient } = await loadFixture(collectionFixture)

  await mint.write.create([
    'VVM1',
    'Lorem Ipsum dolor sit amet.',
    TOKEN_TIME,
    0n,
    0n,
  ])

  return {
    mint,
    factory,
    owner,
    publicClient,
  }
}

export async function cloneItemMintedFixture() {
  const { mint, factory, owner, publicClient } = await loadFixture(cloneCollectionFixture)

  await mint.write.create([
    'VVM1',
    'Lorem Ipsum dolor sit amet.',
    TOKEN_TIME,
    0n,
    0n,
  ])

  return {
    mint,
    factory,
    owner,
    publicClient,
  }
}

export async function libraryItemMintedFixture() {
  const { mint, factory, owner, publicClient } = await loadFixture(libraryCollectionFixture)

  await mint.write.create([
    'VVM1',
    'Lorem Ipsum dolor sit amet.',
    TOKEN_TIME,
    0n,
    0n,
  ])

  return {
    mint,
    factory,
    owner,
    publicClient,
  }
}
