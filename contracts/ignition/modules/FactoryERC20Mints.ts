import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const FactoryERC20MintsModule = buildModule('FactoryERC20Mints', (m) => {
  // Prepare base contracts
  const contractMetadata = m.contract('ContractMetadata')
  const artifactReader = m.contract('ArtifactReader')

  // Deploy the renderer
  const renderer = m.contract('Renderer', [], {
    libraries: {
      ArtifactReader: artifactReader,
    }
  })

  // Deploy the factory for MintViaERC20 contracts
  const factoryERC20Mints = m.contract('FactoryERC20Mints', [renderer], {
    libraries: {
      ContractMetadata: contractMetadata,
    },
    after: [contractMetadata, renderer]
  })

  return {
    factoryERC20Mints,
    artifactReader,
    renderer
  }
})

export default FactoryERC20MintsModule
