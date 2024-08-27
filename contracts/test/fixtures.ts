import { parseEther } from 'viem'
import { loadFixture } from '@nomicfoundation/hardhat-toolbox-viem/network-helpers'
import { chunkArray, toByteArray } from '@visualizevalue/mint-utils'
import hre from 'hardhat'
import { ICON, JALIL, TOKEN_TIME } from './constants'

export async function factoryFixture() {
  const [owner] = await hre.viem.getWalletClients()

  const testClient = await hre.viem.getTestClient()
  await testClient.impersonateAccount({ address: JALIL })
  await owner.sendTransaction({ to: JALIL, value: parseEther('1') })

  const contractMetadata = await hre.viem.deployContract('ContractMetadata', [])
  const baseRenderer = await hre.viem.deployContract('Renderer', [])
  const baseImplementation = await hre.viem.deployContract('Mint', [], {
    libraries: {
      ContractMetadata: contractMetadata.address,
    }
  })
  await baseImplementation.write.init(['VV Mint', 'VVM', '', toByteArray(ICON), baseRenderer.address, owner.account.address])

  const factory = await hre.viem.deployContract('Factory', [baseRenderer.address, baseImplementation.address], {
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

  const hash = await factory.write.clone([
    'VV Mints',
    'VVM',
    'Lorem Ipsum dolor sit amet.',
    toByteArray(ICON),
  ])
  await publicClient.waitForTransactionReceipt({ hash })
  const createdEvents = await factory.getEvents.Created()
  const mint = await hre.viem.getContractAt('Mint', createdEvents[0].args.contractAddress)

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
    toByteArray(TOKEN_TIME),
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

export async function itemPreparedFixture() {
  const { mint, factory, owner, publicClient } = await loadFixture(itemMintedFixture)

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
    mint,
    factory,
    owner,
    publicClient,
    largeArtifact,
  }
}
