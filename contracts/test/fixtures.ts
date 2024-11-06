import { parseEther } from 'viem'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { chunkArray, toByteArray, encodeTokenMetadata } from '@visualizevalue/mint-utils'
import hre from 'hardhat'
import { ICON, JALIL, TOKEN_TIME } from './constants'
import FactoryModule from '../ignition/modules/Factory'

export async function baseFixture() {
  const [owner] = await hre.viem.getWalletClients()

  const publicClient = await hre.viem.getPublicClient()

  const testClient = await hre.viem.getTestClient()
  await testClient.impersonateAccount({ address: JALIL })
  await testClient.setBalance({
    address: JALIL,
    value: parseEther('100')
  })
  await testClient.setBalance({
    address: owner.account.address,
    value: parseEther('100')
  })

  return { owner, publicClient }
}

export async function factoryFixture() {
  const { owner, publicClient } = await loadFixture(baseFixture)

  const { factory: factoryProxy, artifactReader } = await hre.ignition.deploy(FactoryModule)

  const factory = await hre.viem.getContractAt('FactoryV1', factoryProxy.address)

  return {
    artifactReader,
    factory,
    owner,
    publicClient,
  }
}

export async function collectionFixture() {
  const { artifactReader, factory, owner, publicClient } = await loadFixture(factoryFixture)

  const hash = await factory.write.clone([
    'VV Mints',
    'VVM',
    'Lorem Ipsum dolor sit amet.',
    toByteArray(ICON),
  ])
  await publicClient.waitForTransactionReceipt({ hash })
  const createdEvents = await factory.getEvents.Created()
  const mint = await hre.viem.getContractAt('Mint', createdEvents[0].args.contractAddress as `0x${string}`)

  return {
    artifactReader,
    mint,
    factory,
    owner,
    publicClient,
  }
}

export async function itemMintedFixture() {
  const { artifactReader, mint, factory, owner, publicClient } = await loadFixture(collectionFixture)

  await mint.write.create([
    encodeTokenMetadata(
      'VVM1',
      'Lorem Ipsum dolor sit amet.'
    ),
    toByteArray(TOKEN_TIME),
    0,
    0n,
  ])

  return {
    artifactReader,
    mint,
    factory,
    owner,
    publicClient,
  }
}

export async function itemPreparedFixture() {
  const { artifactReader, mint, factory, owner, publicClient } = await loadFixture(itemMintedFixture)

  const largeArtifact = [...new Array(3000)]
    .map(_ => `Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum, maxime iste! Rerum, ipsam facilis aut placeat, laboriosam ex adipisci accusantium debitis corporis eaque voluptatem sequi quod pariatur officiis dignissimos obcaecati!`)
    .join('')
  const chunks = chunkArray(toByteArray(largeArtifact), 5)

  for (const chunk of chunks) {
    await mint.write.prepareArtifact(
      [
        2n,
        chunk,
        false,
      ]
    )
  }

  return {
    artifactReader,
    mint,
    factory,
    owner,
    publicClient,
    largeArtifact,
  }
}
