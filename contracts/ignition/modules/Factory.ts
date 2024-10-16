import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import { toByteArray } from '@visualizevalue/mint-utils'
import { ICON } from '../../test/constants'

const FactoryModule = buildModule('Factory', (m) => {
  const owner = m.getAccount(0)

  // Prepare base contracts
  const contractMetadata = m.contract('ContractMetadata')
  const artifactReader = m.contract('ArtifactReader')
  const renderer = m.contract('Renderer', [], {
    libraries: {
      ArtifactReader: artifactReader,
    }
  })
  const mint = m.contract('Mint', [], {
    libraries: {
      ContractMetadata: contractMetadata,
    },
    after: [contractMetadata, renderer]
  })
  m.call(mint, 'init', ['VV Mint', 'VVM', '', toByteArray(ICON), renderer, owner])

  // Deploy the initial Factory implementation
  const factoryV1 = m.contract('FactoryV1', [], {
    libraries: {
      ContractMetadata: contractMetadata,
    }
  })

  // Deploy the factory proxy
  const factory = m.contract('Factory', [
    factoryV1,
    mint,
    renderer,
  ])

  return {
    artifactReader,
    factory
  }
})

export default FactoryModule
