import { zeroAddress } from 'viem'
import { formatAbi } from 'abitype'
import { task } from 'hardhat/config'

task('export:abi:factory:v1', 'Exports an abi in its human readable form')
  .setAction(async (_, hre) => {
    const contractMetadata = await hre.viem.deployContract('ContractMetadata', [])

    const factory = await hre.viem.deployContract('FactoryV1', [], {
      libraries: {
        ContractMetadata: contractMetadata.address,
      }
    })

    console.log(formatAbi(factory.abi))
  })

task('export:abi:mint', 'Exports an abi in its human readable form')
  .setAction(async (_, hre) => {
    const contractMetadata = await hre.viem.deployContract('ContractMetadata', [])

    const mint = await hre.viem.deployContract('Mint', [], {
      libraries: {
        ContractMetadata: contractMetadata.address
      }
    })

    console.log(formatAbi(mint.abi))
  })
